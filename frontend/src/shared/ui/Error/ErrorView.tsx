
interface ErrorViewProps {
  message: string;
  onReset: () => void;
}

function ErrorView({ message, onReset }: ErrorViewProps) {
  return (
    <div>
      <h2>Error</h2>
      <h3>{message}</h3>
      <button onClick={onReset}>Reload</button>
    </div>
  );
}

export default ErrorView;
