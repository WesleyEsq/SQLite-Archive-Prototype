import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export default function EntryViewText({ entry, startEditing, handleDelete }) {
    return (
        <>
            <td className="rank-col" style={{textAlign: 'center'}}>{entry.number}</td>
            <td className="title-col" style={{ color: '#333', fontWeight: 'bold' }}>{entry.title}</td>
            <td className="comment-col" style={{ color: '#555', fontSize: '0.9em', maxWidth: '300px' }}>{entry.comment}</td>
            <td className="rank-text" style={{textAlign: 'center'}}>{entry.rank}</td>
            <td className="actions-cell">
                <button className="icon-action-btn edit" onClick={(e) => { e.stopPropagation(); startEditing(entry); }} title="Edit">
                    <Pencil size={18} />
                </button>
                <button className="icon-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} title="Delete">
                    <Trash2 size={18} />
                </button>
            </td>
        </>
    );
}