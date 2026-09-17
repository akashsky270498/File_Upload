import React from 'react';
import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface PhoneInputProps {
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneDigits: string;
  setPhoneDigits: (digits: string) => void;
  error?: string;
  onBlur?: () => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  setCountryCode,
  phoneDigits,
  setPhoneDigits,
  error,
  onBlur,
}) => {
  const fullPhone = `${countryCode}${phoneDigits}`;

  return (
    <div className={`sdk-phone-wrapper ${error ? 'has-error' : ''}`}>
      <style>{`
        .sdk-phone-wrapper {
          width: 100%;
          position: relative;
        }
        .sdk-phone-wrapper .react-international-phone-input-container {
          width: 100%;
          height: 52px;
          background: rgba(18, 24, 38, 0.85);
          border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12));
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
        }
        .sdk-phone-wrapper.has-error .react-international-phone-input-container {
          border-color: #ef4444 !important;
        }
        .sdk-phone-wrapper .react-international-phone-input-container:focus-within {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        /* Country Code Trigger Button */
        .sdk-phone-wrapper .react-international-phone-country-selector-button {
          background: rgba(255, 255, 255, 0.04) !important;
          border: none !important;
          border-right: 1px solid var(--border-glass, rgba(255, 255, 255, 0.12)) !important;
          border-radius: 12px 0 0 12px !important;
          padding: 0 14px !important;
          height: 100% !important;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sdk-phone-wrapper .react-international-phone-country-selector-button:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        /* Flag Icon in Trigger Button (Prominent & Clear) */
        .sdk-phone-wrapper .react-international-phone-country-selector-button__flag-emoji,
        .sdk-phone-wrapper .react-international-phone-country-selector-button img {
          width: 28px !important;
          height: 20px !important;
          border-radius: 3px !important;
          object-fit: cover !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        /* Dropdown Arrow */
        .sdk-phone-wrapper .react-international-phone-country-selector-button__dropdown-arrow {
          border-top-color: #94a3b8 !important;
          margin-left: 4px;
        }
        /* Floating Dropdown List */
        .sdk-phone-wrapper .react-international-phone-country-selector-dropdown {
          position: absolute !important;
          top: calc(100% + 6px) !important;
          left: 0 !important;
          width: 340px !important;
          max-height: 320px !important;
          background: #111726 !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6) !important;
          color: #ffffff !important;
          z-index: 99999 !important;
          padding: 6px !important;
          overflow-y: auto !important;
        }
        /* Dropdown Item Options */
        .sdk-phone-wrapper .react-international-phone-country-selector-dropdown__item {
          color: #e2e8f0 !important;
          padding: 10px 12px !important;
          border-radius: 8px !important;
          font-size: 0.95rem !important;
          font-weight: 500 !important;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .sdk-phone-wrapper .react-international-phone-country-selector-dropdown__item:hover {
          background: rgba(99, 102, 241, 0.25) !important;
          color: #ffffff !important;
        }
        .sdk-phone-wrapper .react-international-phone-country-selector-dropdown__item-flag-emoji,
        .sdk-phone-wrapper .react-international-phone-country-selector-dropdown__item img {
          width: 24px !important;
          height: 17px !important;
          border-radius: 2px !important;
          object-fit: cover !important;
        }
        .sdk-phone-wrapper .react-international-phone-country-selector-dropdown__item-country-name {
          flex: 1;
        }
        .sdk-phone-wrapper .react-international-phone-country-selector-dropdown__item-dial-code {
          color: #818cf8 !important;
          font-weight: 600 !important;
        }
        /* Main Input Field */
        .sdk-phone-wrapper .react-international-phone-input {
          flex: 1 !important;
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 12px 12px 0 !important;
          color: #ffffff !important;
          font-size: 1.05rem !important;
          font-weight: 500 !important;
          font-family: inherit !important;
          outline: none !important;
          padding: 0 16px !important;
          letter-spacing: 0.5px;
        }
        .sdk-phone-wrapper .react-international-phone-input::placeholder {
          color: #64748b !important;
        }
      `}</style>
      <ReactPhoneInput
        defaultCountry="in"
        value={fullPhone}
        onChange={(phone, meta) => {
          const dialCode = `+${meta.country.dialCode}`;
          setCountryCode(dialCode);
          const digitsOnly = phone.slice(dialCode.length).replace(/\D/g, '');
          setPhoneDigits(digitsOnly);
        }}
        inputProps={{
          onBlur: onBlur,
          placeholder: '98765 43210',
        }}
      />
    </div>
  );
};


