import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { usePartnerContext } from '../context/PartnerContext';
import { phoneTelHref } from '../lib/partnerData';
import { trackGenerateLead, trackCallClick } from '../lib/analytics';

type CallButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  placement: string;
  children: ReactNode;
  hideWhenNoPhone?: boolean;
};

/** 전화 CTA — data-event-name=call_click / .linkconnect-call-button */
export default function CallButton({
  placement,
  children,
  className = '',
  hideWhenNoPhone = true,
  ...rest
}: CallButtonProps) {
  const { data, hasPhone } = usePartnerContext();
  if (hideWhenNoPhone && !hasPhone) return null;

  const phone = data.tracking_phone || data.partner_phone;
  const href = hasPhone ? phoneTelHref(phone) : undefined;

  return (
    <a
      {...rest}
      href={href}
      className={`linkconnect-call-button ${className}`.trim()}
      data-event-name="call_click"
      data-placement={placement}
      data-phone={phone || undefined}
      onClick={(e) => {
        if (!hasPhone) {
          e.preventDefault();
        } else {
          trackCallClick(placement);
        }
        rest.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}

export { trackGenerateLead };
