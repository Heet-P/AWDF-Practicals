export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state" role="alert">
      <p className="error-title">Could not load repositories</p>
      <p className="muted">{message}</p>
      {onRetry && (
        <button className="ghost" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
