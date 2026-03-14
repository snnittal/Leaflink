import React from "react";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  left,
  right,
  children,
  className,
}) => {
  return (
    <div className={className ?? "page"}>
      <div className="three-column-layout">
        <div className="three-col-left">{left ?? <Sidebar />}</div>
        <div className="three-col-middle">{children}</div>
        <div className="three-col-right">{right ?? null}</div>
      </div>
    </div>
  );
};

export default PageLayout;
