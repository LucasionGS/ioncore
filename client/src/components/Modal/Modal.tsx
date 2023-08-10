import { IconX } from "@tabler/icons-react";
import { Paper } from "@ioncore/theme/Paper/Paper";
import "./Modal.scss";
import React from "react";

export interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  opened: boolean;
  closeOnOutsideClick?: boolean;
}

export default function Modal(props: ModalProps) {
  const { opened, onClose, closeOnOutsideClick = false, children } = props;
  if (!opened) {
    return <></>;
  }
  return (
    <div className="modal" onClick={e => {
      closeOnOutsideClick && onClose();
    }}>
      <Paper className="modal__content" onClick={e => {
        e.stopPropagation();
      }}>
        <div className="modal__close" onClick={onClose}>
          <IconX size={24} />
        </div>
        {children}
      </Paper>
    </div>
  );
}

export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { isOpen, open, close };
}