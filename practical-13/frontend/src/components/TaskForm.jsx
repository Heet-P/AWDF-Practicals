import { useState } from 'react';
import { suggestTask } from '../api.js';

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  // AI suggestion state: idle -> loading -> (suggestion | notice)
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null); // { description, priority }
  const [aiNotice, setAiNotice] = useState(null);

  const askAi = async () => {
    setAiLoading(true);
    setAiNotice(null);
    setSuggestion(null);
    try {
      const result = await suggestTask(title.trim());
      if (result.fallback) {
        setAiNotice('AI suggestions are unavailable right now. You can still write the description yourself.');
      } else {
        setSuggestion({ description: result.description, priority: result.priority });
      }
    } catch (err) {
      setAiNotice(err.message); // e.g. the 429 "please wait" message
    } finally {
      setAiLoading(false);
    }
  };

  // The suggestion is only a draft: the user edits it and decides whether to use it
  const acceptSuggestion = () => {
    setDescription(suggestion.description);
    if (suggestion.priority) setPriority(suggestion.priority);
    setSuggestion(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), priority });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setSuggestion(null);
    setAiNotice(null);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" required />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />

      {suggestion && (
        <div className="ai-card">
          <span className="ai-label">
            ✦ AI suggestion{suggestion.priority && <> · priority: {suggestion.priority}</>}
          </span>
          <textarea
            rows={2}
            value={suggestion.description}
            onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })}
            aria-label="AI suggested description"
          />
          <span className="ai-disclaimer">AI-generated. Review and edit it before saving.</span>
          <div className="row">
            <button type="button" className="ghost small" onClick={() => setSuggestion(null)}>
              Dismiss
            </button>
            <button type="button" className="solid small" onClick={acceptSuggestion}>
              Use suggestion
            </button>
          </div>
        </div>
      )}
      {aiNotice && (
        <p className="ai-notice" role="status">
          {aiNotice}
        </p>
      )}

      <div className="row">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <span className="row-end">
          <button type="button" className="ghost" onClick={askAi} disabled={!title.trim() || aiLoading}>
            {aiLoading ? 'Thinking...' : '✦ Suggest with AI'}
          </button>
          <button className="solid" type="submit" disabled={!title.trim()}>
            Add task
          </button>
        </span>
      </div>
    </form>
  );
}
