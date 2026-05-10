export default function DemoBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 text-xs font-semibold text-white py-2 px-4"
      style={{ background: 'linear-gradient(90deg, #C0002A 0%, #FF0A54 100%)' }}
    >
      <span>✨</span>
      <span>Demo Mode — No backend required. Running with dummy data.</span>
      <span>✨</span>
    </div>
  );
}
