import React, { useState } from "react";

import { useRouter } from "next/router";

import useSWR from "swr";

// services
import projectService from "services/project.service";
import trackEventServices from "services/track-event.service";
// ui
import { AssigneesList, Avatar, CustomSearchSelect, Tooltip } from "components/ui";
// icons
import { UserGroupIcon } from "@heroicons/react/24/outline";
// types
import { ICurrentUserResponse, IIssue } from "types";
// fetch-keys
import { PROJECT_MEMBERS } from "constants/fetch-keys";
import useProjectMembers from "hooks/use-project-members";

type Props = {
  issue: IIssue;
  partialUpdateIssue: (formData: Partial<IIssue>, issue: IIssue) => void;
  position?: "left" | "right";
  tooltipPosition?: "top" | "bottom";
  selfPositioned?: boolean;
  customButton?: boolean;
  user: ICurrentUserResponse | undefined;
  isNotAllowed: boolean;
};

export const ViewAssigneeSelect: React.FC<Props> = ({
  issue,
  partialUpdateIssue,
  position = "left",
  selfPositioned = false,
  tooltipPosition = "top",
  user,
  isNotAllowed,
  customButton = false,
}) => {
  const [fetchAssignees, setFetchAssignees] = useState(false);

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { members } = useProjectMembers(workspaceSlug?.toString(), issue.project, fetchAssignees);

  const options = members?.map((member) => ({
    value: member.member.id,
    query:
      (member.member.first_name && member.member.first_name !== ""
        ? member.member.first_name
        : member.member.email) +
        " " +
        member.member.last_name ?? "",
    content: (
      <div className="flex items-center gap-2">
        <Avatar user={member.member} />
        {`${
          member.member.first_name && member.member.first_name !== ""
            ? member.member.first_name
            : member.member.email
        } ${member.member.last_name ?? ""}`}
      </div>
    ),
  }));

  const assigneeLabel = (
    <Tooltip
      position={tooltipPosition}
      tooltipHeading="Assignees"
      tooltipContent={
        issue.assignee_details.length > 0
          ? issue.assignee_details
              .map((assignee) =>
                assignee?.first_name !== "" ? assignee?.first_name : assignee?.email
              )
              .join(", ")
          : "No Assignee"
      }
    >
      <div
        className={`flex ${
          isNotAllowed ? "cursor-not-allowed" : "cursor-pointer"
        } items-center gap-2 text-custom-text-200`}
      >
        {issue.assignees && issue.assignees.length > 0 && Array.isArray(issue.assignees) ? (
          <div className="-my-0.5 flex items-center justify-center gap-2">
            <AssigneesList userIds={issue.assignees} length={5} showLength={true} />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <UserGroupIcon className="h-4 w-4 text-custom-text-200" />
          </div>
        )}
      </div>
    </Tooltip>
  );

  return (
    <CustomSearchSelect
      value={issue.assignees}
      onChange={(data: any) => {
        const newData = issue.assignees ?? [];

        if (newData.includes(data)) newData.splice(newData.indexOf(data), 1);
        else newData.push(data);

        partialUpdateIssue({ assignees_list: data }, issue);

        trackEventServices.trackIssuePartialPropertyUpdateEvent(
          {
            workspaceSlug,
            workspaceId: issue.workspace,
            projectId: issue.project_detail.id,
            projectIdentifier: issue.project_detail.identifier,
            projectName: issue.project_detail.name,
            issueId: issue.id,
          },
          "ISSUE_PROPERTY_UPDATE_ASSIGNEE",
          user
        );
      }}
      options={options}
      {...(customButton ? { customButton: assigneeLabel } : { label: assigneeLabel })}
      multiple
      noChevron
      position={position}
      disabled={isNotAllowed}
      onOpen={() => setFetchAssignees(true)}
      selfPositioned={selfPositioned}
      width="w-full min-w-[12rem]"
    />
  );
};
