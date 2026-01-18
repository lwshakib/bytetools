import React, { SVGProps } from "react";

export interface LogoIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  fill?: string;
  size?: number | string;
}

export const LogoIcon = ({
  className,
  fill = "currentColor",
  size = 24,
  ...rest
}: LogoIconProps): React.ReactElement => {
  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <g fill={fill} transform="translate(7 0)">
        <path d="m9.45659 17.2143 14.84611-8.57144-8.9077-5.14286-14.845839 8.5713-.000333 17.1426 8.907692 5.1429z" />
        <path d="m33.4453 17.7859v17.1429l-14.8462 8.5711-8.90769-5.1429 14.84619-8.5714v-17.1425z" />
      </g>
    </svg>
  );
};

export interface LogoProps {
  className?: string;
  iconSize?: number | string;
  textSize?: string;
}

export const Logo = ({
  className = "",
  iconSize = 34,
  textSize = "1.5rem",
}: LogoProps): React.ReactElement => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon size={iconSize} className="text-foreground shrink-0" />
      <span
        style={{
          fontSize: textSize,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
        className="text-foreground truncate group-data-[collapsible=icon]:hidden"
      >
        ByteTools
      </span>
    </div>
  );
};
