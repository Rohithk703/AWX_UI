import { useTranslation } from 'react-i18next';
import { compareStrings, usePageNavigate } from '../../../../../framework';
import { pulpAPI } from '../../../common/api/formatPath';
import { hubAPIDelete } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { Repository } from '../Repository';
import { useRepositoriesColumns } from './useRepositoriesColumns';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { nameKeyFn } from '../../../../common/utils/nameKeyFn';
import { HubRoute } from '../../../main/HubRoutes';

export function useDeleteRepositories(onComplete?: (collections: Repository[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useRepositoriesColumns();
  const bulkAction = useHubBulkConfirmation<Repository>();
  const pageNavigate = usePageNavigate();

  const deleteRepositories = (repositories: Repository[]) => {
    bulkAction({
      title: t('Permanently delete repositories', { count: repositories.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} repositories.', {
        count: repositories.length,
      }),
      actionButtonText: t('Delete repositories', { count: repositories.length }),
      items: repositories.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: nameKeyFn,
      isDanger: true,
      confirmationColumns,
      actionColumns: confirmationColumns,
      onComplete,
      alertPrompts: [t('This will also delete all associated resources under this repositories.')],
      actionFn: (repository: Repository, signal: AbortSignal) => {
        return hubAPIDelete(
          pulpAPI`/repositories/ansible/ansible/${parsePulpIDFromURL(repository.pulp_href)}/`,
          signal
        ).then(() => pageNavigate(HubRoute.Repositories));
      },
    });
  };
  return deleteRepositories;
}
