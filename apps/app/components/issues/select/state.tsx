import React from "react";

import { useRouter } from "next/router";

import useSWR from "swr";

// services
import stateService from "services/state.service";
// ui
import { CustomSearchSelect } from "components/ui";
// icons
import { PlusIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { getStateGroupIcon } from "components/icons";
// helpers
import { getStatesList } from "helpers/state.helper";
// fetch keys
import { STATES_LIST } from "constants/fetch-keys";

type Props = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  onChange: (value: string) => void;
  projectId: string;
};

export const IssueStateSelect: React.FC<Props> = ({ setIsOpen, value, onChange, projectId }) => {
  // states
  const router = useRouter();
  const { workspaceSlug } = router.query;

  const { data: stateGroups } = useSWR(
    workspaceSlug && projectId ? STATES_LIST(projectId) : null,
    workspaceSlug && projectId
      ? () => stateService.getStates(workspaceSlug as string, projectId)
      : null
  );
  const states = getStatesList(stateGroups);

  const options = states?.map((state) => ({
    value: state.id,
    query: state.name,
    content: (
      <div className="flex items-center gap-2">
        {getStateGroupIcon(state.group, "16", "16", state.color)}
        {state.name}
      </div>
    ),
  }));

  const selectedOption = states?.find((s) => s.id === value);
  const currentDefaultState = states?.find((s) => s.default);

  return (
    <CustomSearchSelect
      value={value}
      onChange={onChange}
      options={options}
      label={
        <div className="flex items-center gap-2">
          {selectedOption ? (
            getStateGroupIcon(selectedOption.group, "16", "16", selectedOption.color)
          ) : currentDefaultState ? (
            getStateGroupIcon(currentDefaultState.group, "16", "16", currentDefaultState.color)
          ) : (
            <Squares2X2Icon className="h-3.5 w-3.5 text-custom-text-200" />
          )}
          {selectedOption?.name
            ? selectedOption.name
            : currentDefaultState?.name ?? <span className="text-custom-text-200">State</span>}
        </div>
      }
      footerOption={
        <button
          type="button"
          className="flex w-full select-none items-center gap-2 rounded px-1 py-1.5 text-xs text-custom-text-200 hover:bg-custom-background-80"
          onClick={() => setIsOpen(true)}
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Create New State
        </button>
      }
      noChevron
    />
  );
};
