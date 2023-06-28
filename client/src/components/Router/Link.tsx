import React, { AnchorHTMLAttributes } from "react";
import { AppContext, AppState } from ".";
import "./Link.scss";

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
  block?: boolean;
}

/**
 * A link component that can be used to navigate to other pages.\
 * Regular click events are prevented and the path is changed instead.
 * 
 * Link still works with right click and middle click like a regular link.
 * 
 * Automatically adds the `href` attribute if none is provided, and child is a string.
 * @param props Anchor element properties.
 * @returns 
 */
export default function Link(props: LinkProps) {
  const context = React.useContext(AppContext);
  const { children, block } = props;

  const _props = { ...props };

  if (!_props.href && typeof _props.children === "string") {
    _props.href = _props.children;
  }

  const newProps = createLinkSwitch(_props, context);
  delete newProps.block;
  delete newProps.external;
  delete newProps.children;
  return (
    <a className="link" {...newProps}>
      {
        block ? (
          <div className="link-block">
            {children}
          </div>
        ) : children
      }
    </a>
  )
}


interface LinkSwitch {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  href?: string;
  target?: string;
  external?: boolean;
}

export function createLinkSwitch<T extends LinkSwitch>(props: T, context: AppState): T {
  const { onClick, href, target = "_self", external } = props;
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    // if (!e.isDefaultPrevented() && href && !href.startsWith("#") && !href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("//") && target === "_self" && !external) {
    if (!e.isDefaultPrevented() && href && !external) {
      e.preventDefault();
      context.setPath(href);
    }
  };

  return { ...props, onClick: handleClick };
}
