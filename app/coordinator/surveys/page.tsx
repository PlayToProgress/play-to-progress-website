"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Input, Label, Select, Textarea, Pill } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useToast, errorMessage } from "@/components/ui/Toast";

interface Cohort {
  _id: string;
  name: string;
}
interface Survey {
  _id: string;
  title: string;
  description?: string;
  published: boolean;
  targetAudience: string[];
}
interface SurveyResponseRow {
  _id: string;
  respondentRole: string;
  answers: { questionId: string; value: string }[];
}

export default function SurveysPage() {
  const { showToast } = useToast();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [responses, setResponses] = useState<SurveyResponseRow[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [form, setForm] = useState({
    cohortId: "",
    title: "",
    description: "",
    questionText: "",
    audience: "participant",
    published: true,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    apiFetch<{ surveys: Survey[] }>("/api/surveys")
      .then((d) => setSurveys(d.surveys))
      .catch((err) => showToast(errorMessage(err, "Couldn't load surveys.")));
  }, [showToast]);

  useEffect(() => {
    apiFetch<{ cohorts: Cohort[] }>("/api/cohorts")
      .then((d) => {
        setCohorts(d.cohorts);
        if (d.cohorts[0]) setForm((f) => ({ ...f, cohortId: d.cohorts[0]._id }));
      })
      .catch((err) => showToast(errorMessage(err, "Couldn't load cohorts.")));
    load();
  }, [showToast, load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/surveys", {
        method: "POST",
        body: JSON.stringify({
          cohortId: form.cohortId,
          title: form.title,
          description: form.description,
          questions: [{ id: "q1", text: form.questionText, type: "text" }],
          targetAudience: [form.audience],
          published: form.published,
        }),
      });
      setForm({ ...form, title: "", description: "", questionText: "" });
      showToast("Survey published.", "success");
      load();
    } catch (err) {
      showToast(errorMessage(err, "Couldn't publish the survey."));
    } finally {
      setSaving(false);
    }
  }

  async function viewResponses(id: string) {
    setSelected(id);
    setLoadingResponses(true);
    try {
      const d = await apiFetch<{ responses: SurveyResponseRow[] }>(`/api/surveys/${id}/responses`);
      setResponses(d.responses);
    } catch (err) {
      showToast(errorMessage(err, "Couldn't load responses."));
    } finally {
      setLoadingResponses(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-1">Co-Design Surveys</h1>
      <p className="text-white/50 text-sm mb-6">
        Publish feedback forms to participants, parents, or partners and see aggregated results.
      </p>

      <Card className="mb-8">
        <p className="font-display font-bold mb-4">New survey</p>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Cohort</Label>
            <Select value={form.cohortId} onChange={(e) => setForm({ ...form, cohortId: e.target.value })}>
              {cohorts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Audience</Label>
            <Select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="participant">Participants</option>
              <option value="parent">Parents</option>
              <option value="partner">Partners</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Question</Label>
            <Input
              required
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              placeholder="e.g. What would you like to see more of next term?"
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" loading={saving}>
              Publish Survey
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {surveys.map((s) => (
          <Card key={s._id}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-display font-bold">{s.title}</p>
              <Pill tone={s.published ? "green" : "gray"}>{s.published ? "published" : "draft"}</Pill>
            </div>
            <p className="text-xs text-white/40 mb-3">Audience: {s.targetAudience.join(", ")}</p>
            <Button
              variant="outline"
              className="text-xs px-3 py-1.5"
              loading={loadingResponses && selected === s._id}
              onClick={() => viewResponses(s._id)}
            >
              View responses
            </Button>
            {selected === s._id && !loadingResponses && (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {responses.length === 0 && <p className="text-xs text-white/30">No responses yet.</p>}
                {responses.map((r) => (
                  <div key={r._id} className="text-xs text-white/60">
                    <span className="text-gold uppercase">{r.respondentRole}</span>:{" "}
                    {r.answers.map((a) => a.value).join(", ")}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
