import React, {useEffect, useState} from 'react';
import WalletService from "../services/WalletService";



function Wallet({username, role}){

const [input, setInput] = useState("");
const [balance, setBalance] = useState( null);
const [error, setError] = useState(null);
const customer = role === "KUNDE";



// Get Balance
    useEffect(() => {
        WalletService.getBalance(username)
            .then((data) => {
                setBalance(data);
                console.log(data);
            })
            .catch((error) => {
                console.error("Balance not found", error);
                setError("Fehler beim Abrufen des Geldkontos");
            });
    }, [username]);



const handleInput = (e) => {
    const value = e.target.value;

    if(value.match(/\./g)){
        const [, decimal] = value.split(".");

        if(decimal?.length > 2){
            return;
        }
    }
    setInput(value);
}

const handleSubmit = async (e) =>{
    e.preventDefault();

    const { success, error } = await WalletService.uploadMoney(username,input);
    if (success) {
        alert('Geld wurde hochgeladen');
        setInput("");

        try{
            const response = await WalletService.getBalance(username);
            setBalance(response);
        } catch(error){
            console.error("Error reloading balance: ", error);
            setError("Fehler beim Aktualisieren");
        }
    } else {
        alert('Fehler beim hochladen: ' + error);
    }
}





    return(
        <>
            <h2>Geldkonto</h2>

            <h3>Kontostand:</h3> <p> {balance?.toFixed(2)} € </p>

                {customer &&
                <form onSubmit={handleSubmit}>

                  <input  type={"number"} step={"0.01"} onChange={handleInput} value={input}
                  placeholder={"Geldkonto aufladen"}/>
                  <button type={"submit"}>Hochladen</button>

                </form>}
            {error && <p>{error}</p>}
        </>
    );
}

export default Wallet;