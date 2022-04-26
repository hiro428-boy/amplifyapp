import React, { useState, useEffect } from 'react';
// import logo from './logo.svg';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react-v1'
import "@aws-amplify/ui-react/styles.css"
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' };
function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, [])

  //APIクラスを使用してクエリをGraphQL APIに送信し、メモのリストを取得します
  const fetchNotes = async () => {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  //APIクラスを使用してクエリをGraphQL APIに送信しする。GraphQL API変異に必要な変数を渡して、フォームデータで新しいノートを作成できる
  const createNote = async() => {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([...notes, formData]);
    setFormData(initialFormState);
  }

  //変数と共にGraphQLミューテーションを送信しますが、メモを作成する代わりにメモを削除します
  const deleteNote = async ({id}) => {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }
  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={(e) => setFormData({ ...formData, 'name': e.target.value })}
        placeholder='Note name'
        value={formData.name}
      />
      <input
        onChange={(e) => setFormData({ ...formData, 'description': e.target.value })}
        placeholder='Note description'
        value={formData.description}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut/>
    </div>
  );
}

export default withAuthenticator(App);
