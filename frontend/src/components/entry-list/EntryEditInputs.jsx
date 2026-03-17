import React from 'react';
import { Check, X } from 'lucide-react';

export default function EntryEditInputs({ editForm, handleChange, saveEdit, cancelEditing }) {
    return (
        <>
            <td><input name="number" className="inline-input" value={editForm.number || ''} onChange={handleChange} style={{width: '50px'}}/></td>
            <td><input name="title" className="inline-input" value={editForm.title || ''} onChange={handleChange} autoFocus placeholder="Title" /></td>
            <td><input name="comment" className="inline-input" value={editForm.comment || ''} onChange={handleChange} placeholder="Comment" /></td>
            <td><input name="rank" className="inline-input" value={editForm.rank || ''} onChange={handleChange} style={{width: '60px'}}/></td>
           
            <td className="actions-cell">
                <button className="icon-action-btn save" onClick={(e) => { e.stopPropagation(); saveEdit(); }} title="Save">
                    <Check size={18} />
                </button>
                <button className="icon-action-btn cancel" onClick={(e) => { e.stopPropagation(); cancelEditing(); }} title="Cancel">
                    <X size={18} />
                </button>
            </td>
        </>
    );
}