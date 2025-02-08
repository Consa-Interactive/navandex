import { useState } from "react";
import Modal from "../ui/Modal";
import MarkdownContent from "./MarkdownContent";

interface LegalLinksProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export function LegalLinks({ onOpenTerms, onOpenPrivacy }: LegalLinksProps) {
  return (
    <>
      <button
        onClick={onOpenTerms}
        className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
      >
        Terms of Service
      </button>
      {" and "}
      <button
        onClick={onOpenPrivacy}
        className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
      >
        Privacy Policy
      </button>
    </>
  );
}

export function TermsAndPrivacyModals() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <LegalLinks
        onOpenTerms={() => setIsTermsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <Modal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        title="Terms & Conditions"
      >
        <MarkdownContent filePath="/legal/terms-of-use.md" />
      </Modal>

      <Modal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="Privacy Policy"
      >
        <MarkdownContent filePath="/legal/privacy-and-policy.md" />
      </Modal>
    </>
  );
}
