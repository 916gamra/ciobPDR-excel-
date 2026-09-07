
/**
 * RoboticHand Icon - Compatible with Lucide React icon standard
 * Represents a robotic arm / robotic gripper hand for Machine Families
 */
export function RoboticHand({
  className = 'w-4 h-4',
  size,
  color = 'currentColor',
  strokeWidth = 2,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Wrist / base actuator */}
      <path d="M4 18h6v3H4z" />
      <path d="M7 14v4" />
      {/* Palm / joint knuckle */}
      <rect x="7" y="10" width="6" height="4" rx="1" />
      {/* Left gripper finger / claw */}
      <path d="M7 10 4.5 6A1.5 1.5 0 0 1 6 4.5L9.5 9" />
      {/* Right gripper finger / claw */}
      <path d="M13 10l2.5-4A1.5 1.5 0 0 0 14 4.5L10.5 9" />
      {/* Center sensor / hydraulic joint */}
      <circle cx="10" cy="12" r="1" fill="currentColor" />
      {/* Connection link extension */}
      <path d="M13 12h7" />
    </svg>
  );
}

export default RoboticHand;
