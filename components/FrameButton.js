export function FrameButton({ children, ...props }) {
    return (
      <button className="frame-button" {...props}>
        {children}
      </button>
    );
  }