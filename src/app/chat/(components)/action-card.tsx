export default function ActionCard({
  action,
  onClick,
}: {
  action: string;
  onClick: () => void;
}) {
  return (
    <div
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {action}
    </div>
  );
}
