export default function EmergencyBanner() {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "var(--danger)",
        background: "color-mix(in srgb, var(--danger) 10%, var(--surface) 90%)",
      }}
    >
      <h3 className="font-semibold" style={{ color: "var(--danger)" }}>
        Need Immediate Help?
      </h3>
      <p className="text-sm">
        If this feels urgent, please contact a trusted person or professional helpline immediately.
      </p>
    </div>
  );
}
