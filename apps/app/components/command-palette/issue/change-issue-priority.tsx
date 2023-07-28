import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useCallback } from "react";
import { mutate } from "swr";

// cmdk
import { Command } from "cmdk";
// services
import issuesService from "services/issues.service";
// types
import { ICurrentUserResponse, IIssue } from "types";
// constants
import { ISSUE_DETAILS, PROJECT_ISSUES_ACTIVITY } from "constants/fetch-keys";
import { PRIORITIES } from "constants/project";
// icons
import { CheckIcon, getPriorityIcon } from "components/icons";

type Props = {
  setIsPaletteOpen: Dispatch<SetStateAction<boolean>>;
  issue: IIssue;
  user: ICurrentUserResponse;
};

export const ChangeIssuePriority: React.FC<Props> = ({ setIsPaletteOpen, issue, user }) => {
  const router = useRouter();
  const { workspaceSlug, projectId, issueId } = router.query;

  const submitChanges = useCallback(
    async (formData: Partial<IIssue>) => {
      if (!workspaceSlug || !projectId || !issueId) return;

      mutate<IIssue>(
        ISSUE_DETAILS(issueId as string),
        async (prevData) => {
          if (!prevData) return prevData;

          return {
            ...prevData,
            ...formData,
          };
        },
        false
      );

      const payload = { ...formData };
      await issuesService
        .patchIssue(workspaceSlug as string, projectId as string, issueId as string, payload, user)
        .then(() => {
          mutate(PROJECT_ISSUES_ACTIVITY(issueId as string));
        })
        .catch((e) => {
          console.error(e);
        });
    },
    [workspaceSlug, issueId, projectId, user]
  );

  const handleIssueState = (priority: string | null) => {
    submitChanges({ priority });
    setIsPaletteOpen(false);
  };

  return (
    <>
      {PRIORITIES.map((priority) => (
        <Command.Item
          key={priority}
          onSelect={() => handleIssueState(priority)}
          className="focus:outline-none"
        >
          <div className="flex items-center space-x-3">
            {getPriorityIcon(priority)}
            <span className="capitalize">{priority ?? "None"}</span>
          </div>
          <div>{priority === issue.priority && <CheckIcon className="h-3 w-3" />}</div>
        </Command.Item>
      ))}
    </>
  );
};
