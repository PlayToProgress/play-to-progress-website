"use client";

import { useEffect, useState } from "react";
import { Card, Textarea } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Survey {
  _id: string;
  title: string;
  description?: string;
  questions: { id: string; text: string }[];
}

export default function ParticipantSurveysPage() {
  const { showToast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ surveys: Survey[] }>("/api/surveys")
      .then((d) => setSurveys(d.surveys))
      .catch((err) => showToast(errorMessage(err, "Couldn't load surveys.")));
  }, [showToast]);

  async function submit(survey: Survey) {
    setSubmittingId(survey._id);
    try {
      const answerList = survey.questions.map((q) => ({
        questionId: q.id,
        value: answers[`${survey._id}:${q.id}`] ?? "",
      }));
      await apiFetch(`/api/surveys/${survey._id}/responses`, {
        method: "POST",
        body: JSON.stringify({ answers: answerList }),
      });
      setSubmitted((s) => new Set(s).add(survey._id));
      showToast("Response submitted. Thank you!", "success");
    } catch (err) {
      showToast(errorMessage(err, "Couldn't submit your response."));
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Surveys</h1>
      <p className="text-white/50 text-sm mb-8">
        Your coordinator sometimes asks for feedback to help shape the programme — here&apos;s
        anything currently open.
      </p>

      {surveys.length === 0 && <p className="text-white/40">No surveys for you right now.</p>}

      <div className="space-y-4">
        {surveys.map((s) => (
          <Card key={s._id}>
            <p className="font-display font-bold mb-1">{s.title}</p>
            {s.description && <p className="text-sm text-white/50 mb-4">{s.description}</p>}
            {submitted.has(s._id) ? (
              <p className="text-sm text-gold">Thanks — your response has been recorded.</p>
            ) : (
              <div className="space-y-3">
                {s.questions.map((q) => (
                  <div key={q.id}>
                    <p className="text-sm text-white/70 mb-1">{q.text}</p>
                    <Textarea
                      rows={2}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [`${s._id}:${q.id}`]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <Button loading={submittingId === s._id} onClick={() => submit(s)}>
                  Submit response
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
