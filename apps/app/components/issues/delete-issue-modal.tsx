import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { mutate } from "swr";

// headless ui
import { Dialog, Transition } from "@headlessui/react";
// services
import issueServices from "services/issues.service";
// hooks
import useIssuesView from "hooks/use-issues-view";
import useCalendarIssuesView from "hooks/use-calendar-issues-view";
import useToast from "hooks/use-toast";
import useSpreadsheetIssuesView from "hooks/use-spreadsheet-issues-view";
// icons
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// ui
import { SecondaryButton, DangerButton } from "components/ui";
// types
import type { IIssue, ICurrentUserResponse, ISubIssueResponse } from "types";
// fetch-keys
import {
  CYCLE_ISSUES_WITH_PARAMS,
  MODULE_ISSUES_WITH_PARAMS,
  PROJECT_ARCHIVED_ISSUES_LIST_WITH_PARAMS,
  PROJECT_ISSUES_LIST_WITH_PARAMS,
  SUB_ISSUES,
  VIEW_ISSUES,
} from "constants/fetch-keys";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  data: IIssue | null;
  user: ICurrentUserResponse | undefined;
};

export const DeleteIssueModal: React.FC<Props> = ({ isOpen, handleClose, data, user }) => {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const router = useRouter();
  const { workspaceSlug, projectId, cycleId, moduleId, viewId, issueId } = router.query;
  const isArchivedIssues = router.pathname.includes("archived-issues");

  const { issueView, params } = useIssuesView();
  const { params: calendarParams } = useCalendarIssuesView();
  const { params: spreadsheetParams } = useSpreadsheetIssuesView();

  const { setToastAlert } = useToast();

  useEffect(() => {
    setIsDeleteLoading(false);
  }, [isOpen]);

  const onClose = () => {
    setIsDeleteLoading(false);
    handleClose();
  };

  const handleDeletion = async () => {
    setIsDeleteLoading(true);
    if (!workspaceSlug || !projectId || !data) return;

    await issueServices
      .deleteIssue(workspaceSlug as string, data.project, data.id, user)
      .then(() => {
        if (issueView === "calendar") {
          const calendarFetchKey = cycleId
            ? CYCLE_ISSUES_WITH_PARAMS(cycleId.toString(), calendarParams)
            : moduleId
            ? MODULE_ISSUES_WITH_PARAMS(moduleId.toString(), calendarParams)
            : viewId
            ? VIEW_ISSUES(viewId.toString(), calendarParams)
            : PROJECT_ISSUES_LIST_WITH_PARAMS(data.project, calendarParams);

          mutate<IIssue[]>(
            calendarFetchKey,
            (prevData) => (prevData ?? []).filter((p) => p.id !== data.id),
            false
          );
        } else if (issueView === "spreadsheet") {
          const spreadsheetFetchKey = cycleId
            ? CYCLE_ISSUES_WITH_PARAMS(cycleId.toString(), spreadsheetParams)
            : moduleId
            ? MODULE_ISSUES_WITH_PARAMS(moduleId.toString(), spreadsheetParams)
            : viewId
            ? VIEW_ISSUES(viewId.toString(), spreadsheetParams)
            : PROJECT_ISSUES_LIST_WITH_PARAMS(data.project, spreadsheetParams);
          if (data.parent) {
            mutate<ISubIssueResponse>(
              SUB_ISSUES(data.parent.toString()),
              (prevData) => {
                if (!prevData) return prevData;
                const updatedArray = (prevData.sub_issues ?? []).filter((i) => i.id !== data.id);

                return {
                  ...prevData,
                  sub_issues: updatedArray,
                };
              },
              false
            );
            mutate<IIssue[]>(spreadsheetFetchKey);
          } else {
            mutate<IIssue[]>(
              spreadsheetFetchKey,
              (prevData) => (prevData ?? []).filter((p) => p.id !== data.id),
              false
            );
          }
        } else {
          if (cycleId) mutate(CYCLE_ISSUES_WITH_PARAMS(cycleId as string, params));
          else if (moduleId) mutate(MODULE_ISSUES_WITH_PARAMS(moduleId as string, params));
          else mutate(PROJECT_ISSUES_LIST_WITH_PARAMS(projectId as string, params));
        }

        handleClose();
        setToastAlert({
          title: "Success",
          type: "success",
          message: "Issue deleted successfully",
        });

        if (issueId) router.back();
      })
      .catch((error) => {
        console.log(error);
        setIsDeleteLoading(false);
      });
  };

  const handleArchivedIssueDeletion = async () => {
    setIsDeleteLoading(true);
    if (!workspaceSlug || !projectId || !data) return;

    await issueServices
      .deleteArchivedIssue(workspaceSlug as string, projectId as string, data.id)
      .then(() => {
        mutate(PROJECT_ARCHIVED_ISSUES_LIST_WITH_PARAMS(projectId as string, params));
        handleClose();
        setToastAlert({
          title: "Success",
          type: "success",
          message: "Issue deleted successfully",
        });
        router.back();
      })
      .catch((error) => {
        console.log(error);
        setIsDeleteLoading(false);
      });
  };

  const handleIssueDelete = () =>
    isArchivedIssues ? handleArchivedIssueDeletion() : handleDeletion();

  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-custom-backdrop bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg border border-custom-border-200 bg-custom-background-100 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex w-full items-center justify-start gap-6">
                    <span className="place-items-center rounded-full bg-red-500/20 p-4">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="flex items-center justify-start">
                      <h3 className="text-xl font-medium 2xl:text-2xl">Delete Issue</h3>
                    </span>
                  </div>
                  <span>
                    <p className="text-sm text-custom-text-200">
                      Are you sure you want to delete issue{" "}
                      <span className="break-words font-medium text-custom-text-100">
                        {data?.project_detail.identifier}-{data?.sequence_id}
                      </span>
                      {""}? All of the data related to the issue will be permanently removed. This
                      action cannot be undone.
                    </p>
                  </span>
                  <div className="flex justify-end gap-2">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <DangerButton onClick={handleIssueDelete} loading={isDeleteLoading}>
                      {isDeleteLoading ? "Deleting..." : "Delete Issue"}
                    </DangerButton>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
