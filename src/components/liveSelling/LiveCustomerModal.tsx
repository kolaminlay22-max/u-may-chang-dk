import "./LiveCustomerModal.css";
import type { ChangeEvent, FormEvent } from "react";

export type LiveCustomerFormData = {
  name: string;
  phone: string;
  tiktokUsername: string;
  comment: string;
};

type LiveCustomerModalProps = {
  isOpen: boolean;
  form: LiveCustomerFormData;
  saving: boolean;
  isEditing: boolean;
  onChange: (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

function LiveCustomerModal({
  isOpen,
  form,
  saving,
  isEditing,
  onChange,
  onSubmit,
  onClose,
}: LiveCustomerModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="live-customer-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="live-customer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-customer-modal-title"
      >
        <div className="live-customer-modal-header">
          <div>
            <p className="live-panel-label">NEW LIVE CUSTOMER</p>

            <h2 id="live-customer-modal-title">
  {isEditing ? "Edit Customer" : "Add Customer to Queue"}
</h2>
          </div>

          <button
            type="button"
            className="live-customer-modal-close"
            onClick={onClose}
            aria-label="Close customer form"
          >
            ×
          </button>
        </div>

        <form
          className="live-customer-form"
          onSubmit={onSubmit}
        >
          <div className="live-customer-form-grid">
            <div className="live-customer-form-field">
              <label htmlFor="live-customer-name">
                Customer Name *
              </label>

              <input
                id="live-customer-name"
                name="name"
                type="text"
                value={form.name}
                onChange={onChange}
                placeholder="Example: Cherry"
                autoFocus
              />
            </div>

            <div className="live-customer-form-field">
              <label htmlFor="live-customer-phone">
                Phone Number
              </label>

              <input
                id="live-customer-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
                placeholder="Example: 09xxxxxxxx"
              />
            </div>

            <div className="live-customer-form-field live-customer-form-field-full">
              <label htmlFor="live-customer-tiktok">
                TikTok Username
              </label>

              <input
                id="live-customer-tiktok"
                name="tiktokUsername"
                type="text"
                value={form.tiktokUsername}
                onChange={onChange}
                placeholder="Example: @cherry22"
              />
            </div>

            <div className="live-customer-form-field live-customer-form-field-full">
              <label htmlFor="live-customer-comment">
                TikTok Comment / Order Note
              </label>

              <textarea
                id="live-customer-comment"
                name="comment"
                value={form.comment}
                onChange={onChange}
                placeholder="Example: Dress M x 2"
                rows={4}
              />
            </div>
          </div>

          <div className="live-customer-modal-actions">
            <button
              type="button"
              className="live-customer-cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="live-customer-save-button"
              disabled={saving}
            >
              {saving
  ? "Saving..."
  : isEditing
    ? "Save Changes"
    : "Add Customer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LiveCustomerModal;