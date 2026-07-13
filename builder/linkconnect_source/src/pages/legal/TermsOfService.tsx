import { LegalDocumentPage } from '../../components/legal/LegalDocumentPage';
import { partnerTermsDocument } from '../../content/legal/partnerTerms';

export function TermsOfService() {
  return <LegalDocumentPage doc={partnerTermsDocument} variant="terms" />;
}
