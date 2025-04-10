import { Page } from '@patternfly/react-core';
import useSWR, { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { AnsibleLogin } from '../../common/AnsibleLogin/AnsibleLogin';
import type { AuthOption } from '../../common/SocialAuthLogin';
import { requestGet } from '../../common/crud/Data';
import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';
import { DocsVersionProvider } from '../common/useDocsVersion';
import { useEffect, useState } from 'react';

type AwxAuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function AwxLogin(props: { children: React.ReactNode }) {
  const { data: options } = useSWR<AwxAuthOptions>(awxAPI`/auth/`, requestGet);
  const authOptions: AuthOption[] = [];
  if (options && typeof options === 'object') {
    Object.keys(options).forEach((key) => {
      authOptions.push({ login_url: options[key].login_url, type: key });
    });
  }

  const { activeAwxUser, refreshActiveAwxUser } = useAwxActiveUser();

  // State for theme detection
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  if (activeAwxUser === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activeAwxUser) {
    return (
      <AnsibleLogin
        authOptions={authOptions}
        loginApiUrl="/api/login/"
        onSuccess={() => {
          refreshActiveAwxUser?.();
          void mutate(() => true);
        }}
        brandImg={isDarkMode ? "/assets/drut_white.png":"/assets/drut_dark.png"}
        brandImgAlt={process.env.PRODUCT}
      />
    );
  }

  return (
    <DocsVersionProvider version={undefined}>
      <WebSocketProvider>
        <AwxConfigProvider>{props.children}</AwxConfigProvider>
      </WebSocketProvider>
    </DocsVersionProvider>
  );
}
