import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';






function Search(){


    const[search, setSearch] = useState('');
    const navigate = useNavigate();


    const handleChange = (e) => {
        setSearch(e.target.value);
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        if(search.trim()) {
            navigate(`/profile/${search}`);
        }
    }



    return(
        <div style={{marginLeft:"20px"}}>
            <h2>Benutzer suchen</h2>
            <form onSubmit={handleSubmit} style={{display:"flex", gap:"5px"}}>
            <input type='text' placeholder='Benutzernamen eingeben...'
                   value={search} onChange={handleChange} />

            <button type="submit">Suche</button>
            </form>
        </div>
    );
}

export default Search;