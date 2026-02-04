import { CheckCircle, XCircle, Pencil, Ban, Save, Edit, Trash2, Eye, UserPlus, FolderSync } from "lucide-react";
// import { EditButton, SaveButton, CancelButton, YesButton, DeleteButton, AssignButton, ExportButton, SaveChangeButton, ModifyButton, TodayButton, YesterdayButton, WeeklyButton, CustomButton, SyncButton, ImportButton, ClearButton, CloseButton, SubmitButton, IconApproveButton, IconRejectButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton, IconViewButton, } from "../../../AllButtons/AllButtons";


// NORMAL BUTTONS STARTED HERE
export function EditButton({ onClick }) {
    return (
        <button onClick={onClick} className="edit-btn">
            <Edit className="normal-btn-size" />
            Edit
        </button>
    );
}


export function todo({ onClick }) {
    return (
        <button onClick={onClick} className="todo-btn">
            <Edit className="normal-btn-size" />
            Edit
        </button>
    );
}



export function SaveButton({ onClick }) {
    return (
        <button onClick={onClick} className="save-btn">
            <Save className="normal-btn-size" />
            Save
        </button>
    );
}

export function YesButton({ onClick }) {
    return (
        <button onClick={onClick} className="yes-btn">
            Yes
        </button>
    );
}

export function CancelButton({ onClick }) {
    return (
        <button onClick={onClick} className="cancel-btn">
            Cancel
        </button>
    );
}

export function DeleteButton({ onClick }) {
    return (
        <button onClick={onClick} className="delete-btn">
            <Trash2 className="normal-btn-size" />
            Delete
        </button>
    );
}

export function AssignButton({ onClick }) {
    return (
        <button onClick={onClick} className="assign-btn flex w-full text-sm sm:text-base items-center justify-center">
            <UserPlus className="normal-btn-size" />
            Assign Projects
        </button>
    );
}

export function SyncButton({ onClick }) {
    return (
        <button onClick={onClick} className="sync-btn">
            <FolderSync className="normal-btn-size" />
            Sync Now
        </button>
    );
}

export function ModifyButton({ onClick }) {
    return (
        <button onClick={onClick} className="modify-btn text-sm py-1.5">
            <Trash2 className="normal-btn-size" />
            Delete
        </button>
    );
}


export function ExportButton({ onClick }) {
    return (
        <button onClick={onClick} className="export-btn text-sm py-1.5">
            Export to Excel
        </button>
    );
}

export function ImportButton({ onClick }) {
    return (
        <button onClick={onClick} className="import-btn text-sm py-1.5">
            Import
        </button>
    );
}

export function ClearButton({ onClick }) {
    return (
        <button onClick={onClick} className="clear-btn text-sm py-1.5">
            Clear
        </button>
    );
}

export function CloseButton({ onClick }) {
    return (
        <button onClick={onClick} className="close-pop-btn text-sm py-1.5">
            Close
        </button>
    );
}

export function SubmitButton({ onClick }) {
    return (
        <button onClick={onClick} className="submit-pop-btn text-sm py-1.5">
            Submit
        </button>
    );
}

export function TodayButton({ onClick }) {
    return (
        <button onClick={onClick} className="today-btn text-sm py-1.5">
            Today
        </button>
    );
}

export function YesterdayButton({ onClick }) {
    return (
        <button onClick={onClick} className="yesterday-btn text-sm py-1.5">
            Yesterday
        </button>
    );
}

export function WeeklyButton({ onClick }) {
    return (
        <button onClick={onClick} className="weekly-btn text-sm py-1.5">
            Weekly
        </button>
    );
}

export function MonthlyButton({ onClick }) {
    return (
        <button onClick={onClick} className="weekly-btn text-sm py-1.5">
            Monthly
        </button>
    );
}

export function CustomButton({ onClick }) {
    return (
        <button onClick={onClick} className="custom-btn text-sm py-1.5">
            Custom
        </button>
    );
}

export function SaveChangeButton({ onClick }) {
    return (
        <button onClick={onClick} className="submit-btn flex w-full items-center justify-center">
            Save Changes
        </button>
    );
}


// ICONS BUTTONS STARTED HERE

export function IconApproveButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <CheckCircle className="icon-btn-size approved-icon h-4 w-4" />
        </button>
    );
}

export function IconRejectButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <XCircle className="icon-btn-size rejected-icon h-4 w-4" />
        </button>
    );
}

export function IconCancelTaskButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Ban className="icon-btn-size cancel-icon h-4 w-4" />
        </button>
    );
}

export function IconDeleteButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Trash2 className="icon-btn-size delete-icon h-4 w-4" />
        </button>
    );
}

export function IconEditButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Edit className="icon-btn-size edit-iocn h-4 w-4" />
        </button>
    );
}

export function IconSaveButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Save className="icon-btn-size save-iocn h-4 w-4" />
        </button>
    );
}

export function IconViewButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Eye className="icon-btn-size view-iocn h-4 w-4" />
        </button>
    );
}

// All buttons here

{/* 
<EditButton/>
<SaveButton />
<CancelButton/> 
<YesButton/>
<DeleteButton/>
<AssignButton/>
<SyncButton/>
<ExportButton/>
<ImportButton/>
<ClearButton/>
<CloseButton/>
<SubmitButton/>
<ModifyButton/>
<TodayButton/>
<YesterdayButton/>
<WeeklyButton/>
<CustomButton/>
<SaveChangeButton/>

<IconApproveButton/>
<IconRejectButton/>
<IconCancelTaskButton/>
<IconDeleteButton/>
<IconEditButton/> 
<IconSaveButton/> 
<IconViewButton/>
*/}
