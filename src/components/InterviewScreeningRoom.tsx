import React, { useState, useEffect, useRef } from 'react';
import { JobPosting, CandidateApplication, InterviewQuestion, InterviewTurn, CandidateScorecard } from '../types';
import { 
  fetchInterviewQuestions, 
  checkAnswerFollowUp, 
  evaluateScreeningSession 
} from '../services/geminiService';
import { 
  Bot, 
  User, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  AlertCircle,
  FileCheck,
  Award,
  Calendar,
  RotateCcw
} from 'lucide-react';

interface InterviewScreeningRoomProps {
  application: CandidateApplication | null;
  job: JobPosting;
  onScreeningCompleted: (
    updatedApplication: CandidateApplication,
    scorecard: CandidateScorecard,
    transcript: InterviewTurn[]
  ) => void;
  onScheduleInterview: (application: CandidateApplication) => void;
}

export const InterviewScreeningRoom: React.FC<InterviewScreeningRoomProps> = ({
  application,
  job,
  onScreeningCompleted,
  onScheduleInterview
}) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState<InterviewTurn[]>([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [followUpPrompt, setFollowUpPrompt] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [aiSpeechEnabled, setAiSpeechEnabled] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [completedScorecard, setCompletedScorecard] = useState<CandidateScorecard | null>(null);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Initialize questions on load
  useEffect(() => {
    let isMounted = true;
    async function loadQuestions() {
      setIsLoadingQuestions(true);
      const fetched = await fetchInterviewQuestions(
        job.title,
        job.requirements.join('\n'),
        application?.fullName || 'Candidate',
        application?.resumeText || ''
      );
      if (isMounted) {
        setQuestions(fetched);
        setIsLoadingQuestions(false);
        // Announce first question if voice is on
        if (fetched[0] && aiSpeechEnabled) {
          speakText(fetched[0].question);
        }
      }
    }
    loadQuestions();
    return () => {
      isMounted = false;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [job, application]);

  // Scroll to bottom of chat
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, followUpPrompt, isAiThinking]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !aiSpeechEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const currentQ = questions[currentQuestionIndex];
  const progressPercent = questions.length ? Math.round(((currentQuestionIndex) / questions.length) * 100) : 0;

  // Candidate submits their answer for the current question
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateInput.trim() || !currentQ || isAiThinking) return;

    const answer = candidateInput.trim();
    setIsAiThinking(true);

    // Context-aware analysis via Gemini: is answer vague or needing follow-up?
    const checkResult = await checkAnswerFollowUp(
      currentQ.question,
      answer,
      currentQuestionIndex,
      questions.length,
      job.title
    );

    setIsAiThinking(false);

    // If adaptive follow-up is triggered
    if (checkResult.needsFollowUp && checkResult.followUpQuestion && !followUpPrompt) {
      setFollowUpPrompt(checkResult.followUpQuestion);
      if (aiSpeechEnabled) speakText(checkResult.followUpQuestion);
      return;
    }

    // Otherwise record turn
    completeTurn(answer, null, null);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpAnswer.trim()) return;

    completeTurn(candidateInput.trim(), followUpPrompt, followUpAnswer.trim());
  };

  const completeTurn = (primaryAnswer: string, fUpQ: string | null, fUpA: string | null) => {
    const newTurn: InterviewTurn = {
      questionId: currentQ.id,
      category: currentQ.category,
      question: currentQ.question,
      answer: primaryAnswer,
      followUpQuestion: fUpQ,
      followUpAnswer: fUpA,
      timestamp: new Date().toISOString()
    };

    const updatedTranscript = [...transcript, newTurn];
    setTranscript(updatedTranscript);
    setCandidateInput('');
    setFollowUpPrompt(null);
    setFollowUpAnswer('');

    // Advance to next question or review
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      if (aiSpeechEnabled && questions[nextIdx]) {
        speakText(questions[nextIdx].question);
      }
    } else {
      setIsReviewMode(true);
    }
  };

  const handleFinalSubmitForEvaluation = async () => {
    setIsEvaluating(true);
    const scorecard = await evaluateScreeningSession(
      job.title,
      application?.fullName || 'Candidate',
      application?.resumeText || '',
      transcript
    );

    setCompletedScorecard(scorecard);
    setIsEvaluating(false);

    if (application) {
      const updatedApp: CandidateApplication = {
        ...application,
        status: scorecard.recommendation === 'SHORTLIST' ? 'Shortlisted' : (scorecard.recommendation === 'HOLD' ? 'Hold' : 'Evaluated'),
        scorecard,
        transcript
      };
      onScreeningCompleted(updatedApp, scorecard, transcript);
    }
  };

  // Sample prompt helpers for quick testing
  const insertQuickAnswer = (type: string) => {
    if (job.title.toLowerCase().includes('deliverability')) {
      if (type === 'scale') {
        setCandidateInput('We scaled to 2.4 million outbound messages monthly using 45 secondary domains split across dedicated IP pools on Mailgun and custom Postfix relays. Each domain sends max 35 emails/day with jittered intervals of 12-25 minutes, keeping hard bounce rates under 0.5% and spam complaints below 0.02%.');
      } else if (type === 'protocols') {
        setCandidateInput('We automate SPF flattening via Cloudflare DNS API when lookups exceed 8. DKIM is deployed with 2048-bit keys and rotated quarterly. DMARC is strictly enforced at p=reject, and aggregate RUA telemetry is parsed daily. We monitor Google Postmaster Tools API hourly for IP reputation drop-offs.');
      } else {
        setCandidateInput('I build custom multi-tier waterfall enrichment workflows in Clay connected to Apollo and Prospeo API. When Apollo yields an unverified address, the system waterfalls through MillionVerifier before entering the campaign queue.');
      }
    } else {
      setCandidateInput('I architected an agentic evaluation engine utilizing the Gemini 3.8 Flash SDK with strict JSON Schema outputs. We bypassed LangChain to cut P95 latency from 1.4s to 320ms, and implemented CI/CD regression tests benchmarking hallucination rates across a 500-sample test suite.');
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400">
          <Bot className="h-8 w-8 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        </div>
        <h3 className="text-lg font-bold text-white">Analyzing Resume & Generating Tailored Interview</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1.5">
          Evaluating candidate background against {job.title} competencies to craft 5 context-aware technical questions...
        </p>
      </div>
    );
  }

  // Once evaluation is complete, show the immediate candidate scorecard & schedule option
  if (completedScorecard) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Screening Complete · Auto-Calibrated Scorecard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Candidate Assessment Summary
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Candidate: <span className="text-slate-200 font-medium">{application?.fullName || 'Candidate'}</span> · Role: <span className="text-slate-200 font-medium">{job.title}</span>
              </p>
            </div>

            {/* Overall recommendation badge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">AI Recommendation</div>
                <div className={`text-lg font-extrabold ${
                  completedScorecard.recommendation === 'SHORTLIST' 
                    ? 'text-emerald-400' 
                    : (completedScorecard.recommendation === 'HOLD' ? 'text-amber-400' : 'text-rose-400')
                }`}>
                  {completedScorecard.recommendation === 'SHORTLIST' ? '✓ SHORTLIST FOR ROUND 2' : completedScorecard.recommendation}
                </div>
              </div>
            </div>
          </div>

          {/* Metric scores grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Overall Match</div>
              <div className="text-3xl font-extrabold text-white">
                {completedScorecard.overallScore}<span className="text-sm font-normal text-slate-500">%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Skills Match</div>
              <div className="text-3xl font-extrabold text-indigo-400">
                {completedScorecard.skillsMatchScore}<span className="text-sm font-normal text-slate-500">%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Technical Depth</div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {completedScorecard.technicalScore}<span className="text-sm font-normal text-slate-500">%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Problem Solving</div>
              <div className="text-3xl font-extrabold text-sky-400">
                {completedScorecard.problemSolvingScore}<span className="text-sm font-normal text-slate-500">%</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Executive Overview
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {completedScorecard.executiveSummary}
              </p>
            </div>

            {/* Strengths & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-950/50 bg-emerald-950/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Key Technical Strengths</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {completedScorecard.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-950/50 bg-amber-950/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>Risks & Areas to Validate</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {completedScorecard.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Human Interview Questions */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5">
                Suggested Probing Questions for Round 2 Technical Deep-Dive
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {completedScorecard.recommendedHumanQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold font-mono">Q{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action to book next round */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Scorecard permanently recorded into candidate pipeline. Complete transcript accessible by engineering panel.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {application && (
                <button
                  onClick={() => onScheduleInterview(application)}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Round 2 Human Interview</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Answer review mode prior to final scoring
  if (isReviewMode) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-semibold text-indigo-400">Step 2 of 2 · Screening Review</div>
              <h2 className="text-2xl font-bold text-white">Review Your Answers Before Evaluation</h2>
              <p className="text-xs text-slate-400 mt-1">
                You have answered all {transcript.length} questions. You can review your responses before triggering autonomous scorecard generation.
              </p>
            </div>
            <FileCheck className="h-8 w-8 text-indigo-400 shrink-0" />
          </div>

          <div className="space-y-4 my-6">
            {transcript.map((turn, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-indigo-400">Question {idx + 1} · {turn.category}</span>
                </div>
                <div className="text-sm font-medium text-white">{turn.question}</div>
                <div className="rounded-lg bg-slate-900/80 p-3 text-xs text-slate-200 border border-slate-800">
                  <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">Your Response</span>
                  {turn.answer}
                </div>
                {turn.followUpQuestion && (
                  <div className="rounded-lg bg-indigo-950/30 p-2.5 text-xs text-slate-300 border border-indigo-900/40">
                    <span className="text-[10px] text-indigo-300 uppercase font-semibold block mb-0.5">
                      Adaptive Follow-Up Clarification:
                    </span>
                    <p className="italic text-slate-300">{turn.followUpAnswer || 'Clarified with metrics'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setIsReviewMode(false);
                setCurrentQuestionIndex(0);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart Screening</span>
            </button>

            <button
              onClick={handleFinalSubmitForEvaluation}
              disabled={isEvaluating}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 gap-2"
            >
              {isEvaluating ? (
                <>
                  <Bot className="h-4 w-4 animate-spin" />
                  <span>Evaluating Competencies with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  <span>Submit & Generate Scorecard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active question-by-question interview chat
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-indigo-400">{job.title}</span>
            <span>·</span>
            <span>Candidate: <strong className="text-white font-medium">{application?.fullName || 'Guest Candidate'}</strong></span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Autonomous First-Round Screening</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Audio read-aloud toggle */}
          <button
            onClick={() => {
              const next = !aiSpeechEnabled;
              setAiSpeechEnabled(next);
              if (next && currentQ) speakText(currentQ.question);
              else if (window.speechSynthesis) window.speechSynthesis.cancel();
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              aiSpeechEnabled
                ? 'border-indigo-600 bg-indigo-900/40 text-indigo-200'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            {aiSpeechEnabled ? <Volume2 className="h-4 w-4 text-indigo-400" /> : <VolumeX className="h-4 w-4" />}
            <span>Voice Audio {aiSpeechEnabled ? 'On' : 'Off'}</span>
          </button>

          {/* Progress badge */}
          <div className="text-right">
            <div className="text-[11px] text-slate-400">
              Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of {questions.length}
            </div>
            <div className="h-1.5 w-24 rounded-full bg-slate-800 mt-1 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6">
        {/* Past completed turns */}
        {transcript.map((turn, idx) => (
          <div key={idx} className="space-y-3 pb-4 border-b border-slate-900">
            {/* AI question */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400 shrink-0 border border-indigo-900/50">
                <Bot className="h-4 w-4" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  AI Screener · Question {idx + 1} ({turn.category})
                </div>
                <div className="text-xs sm:text-sm text-slate-200 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  {turn.question}
                </div>
              </div>
            </div>

            {/* Candidate answer */}
            <div className="flex items-start justify-end gap-3">
              <div className="space-y-1 max-w-2xl text-right">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  You
                </div>
                <div className="text-xs sm:text-sm text-slate-100 bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-900/50 text-left">
                  {turn.answer}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 shrink-0">
                <User className="h-4 w-4" />
              </div>
            </div>

            {/* Follow up if any */}
            {turn.followUpQuestion && (
              <div className="pl-11 text-xs text-indigo-300 space-y-1">
                <div className="italic">Adaptive Probe: "{turn.followUpQuestion}"</div>
                {turn.followUpAnswer && <div className="text-slate-300">Answer: {turn.followUpAnswer}</div>}
              </div>
            )}
          </div>
        ))}

        {/* Current active question from AI */}
        {currentQ && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0 shadow-md shadow-indigo-600/30">
                <Bot className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {questions.length} · {currentQ.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Focus: {currentQ.competencyFocus})
                  </span>
                </div>
                <div className="text-sm sm:text-base font-medium text-white bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed shadow-sm">
                  {currentQ.question}
                </div>
              </div>
            </div>

            {/* If adaptive follow-up prompt is active */}
            {followUpPrompt && (
              <div className="ml-12 rounded-xl border border-amber-900/60 bg-amber-950/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Adaptive Follow-up: Clarification Needed</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200">
                  {followUpPrompt}
                </p>

                <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Provide specific metrics, tools, or architectural details..."
                    value={followUpAnswer}
                    onChange={(e) => setFollowUpAnswer(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500"
                  >
                    Send Clarification
                  </button>
                </form>
              </div>
            )}

            {/* Main answer input form */}
            {!followUpPrompt && (
              <div className="ml-0 sm:ml-12 space-y-3">
                {/* Quick helper buttons for testing */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-slate-500">Fast-fill answer:</span>
                  <button
                    type="button"
                    onClick={() => insertQuickAnswer('scale')}
                    className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                  >
                    2.4M/mo Email Cluster
                  </button>
                  <button
                    type="button"
                    onClick={() => insertQuickAnswer('protocols')}
                    className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                  >
                    SPF / DKIM / DMARC p=reject
                  </button>
                  <button
                    type="button"
                    onClick={() => insertQuickAnswer('enrichment')}
                    className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                  >
                    Clay & Apollo Waterfall
                  </button>
                </div>

                <form onSubmit={handleAnswerSubmit} className="space-y-3">
                  <textarea
                    rows={4}
                    required
                    disabled={isAiThinking}
                    placeholder="Type your answer detailing your hands-on methodology, specific tools, metrics, or trade-offs..."
                    value={candidateInput}
                    onChange={(e) => setCandidateInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors leading-relaxed"
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Words: {candidateInput.trim() ? candidateInput.trim().split(/\s+/).length : 0} · Aim for concrete specifics
                    </div>

                    <button
                      type="submit"
                      disabled={isAiThinking || !candidateInput.trim()}
                      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition-all gap-1.5"
                    >
                      {isAiThinking ? (
                        <>
                          <Bot className="h-3.5 w-3.5 animate-spin" />
                          <span>Screening AI is Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Response</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        <div ref={turnsEndRef} />
      </div>
    </div>
  );
};
