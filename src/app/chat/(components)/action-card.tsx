export default function ActionCard({
  action,
  onClick,
}: {
  action: string;
  onClick: () => void;
}) {
  return (
    <div
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-primary/10"
      onClick={onClick}
    >
      {action}
    </div>
  );
}
