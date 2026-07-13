import { LegalDocumentPage } from '../../components/legal/LegalDocumentPage';
import { privacyPolicyDocument } from '../../content/legal/privacyPolicy';

export function PrivacyPolicy() {
  return <LegalDocumentPage doc={privacyPolicyDocument} variant="privacy" />;
}
