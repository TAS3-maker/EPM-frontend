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
        <button onClick={onClick} className="assign-btn flex w-full items-center justify-center">
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
        <button onClick={onClick} className="modify-btn">
            <Trash2 className="normal-btn-size" />
            Delete
        </button>
    );
}


export function ExportButton({ onClick }) {
    return (
        <button onClick={onClick} className="export-btn">
            Export to Excel
        </button>
    );
}

export function ImportButton({ onClick }) {
    return (
        <button onClick={onClick} className="import-btn">
            Import
        </button>
    );
}

export function ClearButton({ onClick }) {
    return (
        <button onClick={onClick} className="clear-btn">
            Clear
        </button>
    );
}

export function CloseButton({ onClick }) {
    return (
        <button onClick={onClick} className="close-pop-btn">
            Close
        </button>
    );
}

export function SubmitButton({ onClick }) {
    return (
        <button onClick={onClick} className="submit-pop-btn">
            Submit
        </button>
    );
}

export function TodayButton({ onClick }) {
    return (
        <button onClick={onClick} className="today-btn">
            Today
        </button>
    );
}

export function YesterdayButton({ onClick }) {
    return (
        <button onClick={onClick} className="yesterday-btn">
            Yesterday
        </button>
    );
}

export function WeeklyButton({ onClick }) {
    return (
        <button onClick={onClick} className="weekly-btn">
            Weekly
        </button>
    );
}

export function CustomButton({ onClick }) {
    return (
        <button onClick={onClick} className="custom-btn">
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
            <CheckCircle className="icon-btn-size approved-icon" />
        </button>
    );
}

export function IconRejectButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <XCircle className="icon-btn-size rejected-icon" />
        </button>
    );
}

export function IconCancelTaskButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Ban className="icon-btn-size cancel-icon" />
        </button>
    );
}

export function IconDeleteButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Trash2 className="icon-btn-size delete-icon" />
        </button>
    );
}

export function IconEditButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Edit className="icon-btn-size edit-iocn" />
        </button>
    );
}

export function IconSaveButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Save className="icon-btn-size save-iocn" />
        </button>
    );
}

export function IconViewButton({ onClick }) {
    return (
        <button onClick={onClick} className="icons-hover">
            <Eye className="icon-btn-size view-iocn" />
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