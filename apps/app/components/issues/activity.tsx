import React from "react";

import { useRouter } from "next/router";

import useSWR from "swr";

// services
import issuesService from "services/issues.service";
// components
import { CommentCard } from "components/issues/comment";
// ui
import { Icon, Loader } from "components/ui";
// helpers
import { timeAgo } from "helpers/date-time.helper";
import { activityDetails } from "helpers/activity.helper";
// types
import { ICurrentUserResponse, IIssueComment } from "types";
// fetch-keys
import { PROJECT_ISSUES_ACTIVITY } from "constants/fetch-keys";

type Props = {
  issueId: string;
  user: ICurrentUserResponse | undefined;
};

export const IssueActivitySection: React.FC<Props> = ({ issueId, user }) => {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;

  const { data: issueActivities, mutate: mutateIssueActivities } = useSWR(
    workspaceSlug && projectId ? PROJECT_ISSUES_ACTIVITY(issueId) : null,
    workspaceSlug && projectId
      ? () =>
          issuesService.getIssueActivities(workspaceSlug as string, projectId as string, issueId)
      : null
  );

  const handleCommentUpdate = async (comment: IIssueComment) => {
    if (!workspaceSlug || !projectId || !issueId) return;

    await issuesService
      .patchIssueComment(
        workspaceSlug as string,
        projectId as string,
        issueId as string,
        comment.id,
        comment,
        user
      )
      .then((res) => mutateIssueActivities());
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!workspaceSlug || !projectId || !issueId) return;

    mutateIssueActivities((prevData) => prevData?.filter((p) => p.id !== commentId), false);

    await issuesService
      .deleteIssueComment(
        workspaceSlug as string,
        projectId as string,
        issueId as string,
        commentId,
        user
      )
      .then(() => mutateIssueActivities());
  };

  if (!issueActivities) {
    return (
      <Loader className="space-y-4">
        <div className="space-y-2">
          <Loader.Item height="30px" width="40%" />
          <Loader.Item height="15px" width="60%" />
        </div>
        <div className="space-y-2">
          <Loader.Item height="30px" width="40%" />
          <Loader.Item height="15px" width="60%" />
        </div>
        <div className="space-y-2">
          <Loader.Item height="30px" width="40%" />
          <Loader.Item height="15px" width="60%" />
        </div>
      </Loader>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-4">
        {issueActivities.map((activityItem, index) => {
          // determines what type of action is performed
          const message = activityItem.field
            ? activityDetails[activityItem.field as keyof typeof activityDetails]?.message(
                activityItem
              )
            : "created the issue.";

          if ("field" in activityItem && activityItem.field !== "updated_by") {
            return (
              <li key={activityItem.id}>
                <div className="relative pb-1">
                  {issueActivities.length > 1 && index !== issueActivities.length - 1 ? (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-custom-background-80"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-2">
                    <div>
                      <div className="relative px-1.5">
                        <div className="mt-1.5">
                          <div className="ring-6 flex h-7 w-7 items-center justify-center rounded-full bg-custom-background-80 text-custom-text-200 ring-white">
                            {activityItem.field ? (
                              activityItem.new_value === "restore" ? (
                                <Icon iconName="history" className="text-sm text-custom-text-200" />
                              ) : (
                                activityDetails[activityItem.field as keyof typeof activityDetails]
                                  ?.icon
                              )
                            ) : activityItem.actor_detail.avatar &&
                              activityItem.actor_detail.avatar !== "" ? (
                              <img
                                src={activityItem.actor_detail.avatar}
                                alt={activityItem.actor_detail.first_name}
                                height={24}
                                width={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div
                                className={`grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gray-700 text-xs text-white`}
                              >
                                {activityItem.actor_detail.first_name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-3">
                      <div className="text-xs text-custom-text-200 break-words">
                        {activityItem.field === "archived_at" &&
                        activityItem.new_value !== "restore" ? (
                          <span className="text-gray font-medium">Plane</span>
                        ) : (
                          <span className="text-gray font-medium">
                            {activityItem.actor_detail.first_name}
                            {activityItem.actor_detail.is_bot
                              ? " Bot"
                              : " " + activityItem.actor_detail.last_name}
                          </span>
                        )}{" "}
                        {message}{" "}
                        <span className="whitespace-nowrap">
                          {timeAgo(activityItem.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          } else if ("comment_json" in activityItem)
            return (
              <div key={activityItem.id} className="mt-4">
                <CommentCard
                  comment={activityItem as IIssueComment}
                  onSubmit={handleCommentUpdate}
                  handleCommentDeletion={handleCommentDelete}
                />
              </div>
            );
        })}
      </ul>
    </div>
  );
};
