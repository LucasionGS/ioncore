import React from "react";

export interface AppState {
  /**
   * Set the content of the router.
   */
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  /**
   * Change the path of the current page.
   */
  setPath: (path: string) => void;
};

export const AppContext = React.createContext<AppState>(null!);

interface ReadyPage {
  title: string,
  content: React.ReactNode;
  args: string[];
}

export interface PageBuild {
  path: RegExp;
  title: string | ((...args: string[]) => string);
  content: React.ReactNode | ((...args: string[]) => Promise<React.ReactNode | React.FC> | React.ReactNode | React.FC);
}

export function useRouter() {
  return React.useContext(AppContext);
}

export default function Router(props: {
  pages: PageBuild[],
  ErrorPage?: (error: {
    statusCode?: number
    error?: Error
  }) => JSX.Element,
  LoadingPage?: () => JSX.Element,
}) {
  const { pages, ErrorPage: CustomErrorPage, LoadingPage } = props;
  // const [pages, setPages] = React.useState<PageBuild[]>(routes ?? []);
  const [
    content, setContent
  ] = React.useState<React.ReactNode>(LoadingPage ? <LoadingPage /> : <div>Processing...</div>);
  const setTitle = (title: string) => {
    document.title = title;
  };

  async function getPage(path: string): Promise<ReadyPage> {
    return new Promise(async (resolve, reject) => {

      const page = pages.find(page => page.path.test(path));
      if (page) {
        const args: string[] = (page.path.exec(path) || []).slice(1);
        const Content: React.ReactNode | React.FC = typeof page.content === "function" ? await page.content(...args) : page.content;
        resolve({
          title: typeof page.title === "function" ? page.title(...args) : page.title,
          content: typeof Content === "function" ? <Content /> : Content,
          args,
        });
      } else {
        reject(new PageError("This page was not found. Please check the URL and try again.", 404));
      }
    });
  }

  const [pagePath, setPagePath] = React.useState(window.location.pathname);
  const setPath = React.useCallback((path: string) => {
    if (path === pagePath) {
      return;
    }
    // Change the path of the current page.
    setPagePath(path);
    window.history.pushState(null, "", path);
  }, [pagePath]);

  const onPathChange = React.useCallback((event: PopStateEvent) => {
    // Change the path of the current page.
    setPagePath(window.location.pathname);
  }, []);

  React.useEffect(() => {
    // Get the page content.
    getPage(pagePath).then(({ title, content }) => {
      setTitle(title);
      setContent(content);
    }).catch((err: Error) => {
      console.error(err);
      setContent(CustomErrorPage ? (<CustomErrorPage statusCode={404} error={err} />) : (<ErrorPage statusCode={404} error={err} />));
    });

    // Update the content when the path changes.
    window.addEventListener("popstate", onPathChange);

    return () => {
      window.removeEventListener("popstate", onPathChange);
    };
  }, [pagePath]);

  const _context: AppState = {
    setContent,
    setPath
  };

  return (
    <AppContext.Provider value={_context}>
      {content}
    </AppContext.Provider>
  );
}

export class PageError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export function ErrorPage(props: {
  statusCode?: number
  error?: Error
}) {
  const { statusCode, error } = props
  const codes = {
    404: "Page not found",
    500: "Internal server error",
  };
  return (
    <div>
      <h1>{(statusCode && `${statusCode} | ${codes[statusCode as keyof typeof codes]}`) || "Unknown error"}</h1>
      <hr />
      {error && <p>{error?.message}</p>}
    </div>
  )
}