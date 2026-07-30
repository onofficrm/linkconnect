"use client";

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { usePartnerContext } from '../context/PartnerContext';
import { phoneTelHref } from '../lib/partnerData';

type CallButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  placement: string;
  children: ReactNode;
  hideWhenNoPhone?: boolean;
};

/** 콜디비 안심번호 CTA — 배정 번호가 있을 때만 노출 */
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
        }
        rest.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
