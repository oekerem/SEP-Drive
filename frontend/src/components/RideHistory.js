import React, {useEffect, useMemo, useState, useContext} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableSortLabel from '@mui/material/TableSortLabel';
import RideHistoryService from "../services/RideHistoryService";
import UserService from "../services/UserService";
import { Link } from 'react-router-dom';
import { AuthContext } from "../contexts/AuthContext";

function RideHistory() {

    const [data, setData] = useState([]);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('endTime');
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const { user: currentUser } = useContext(AuthContext);


   useEffect(() => {


       RideHistoryService.getRideHistory(currentUser?.username)
           .then(async (data) => {
                   const rides = await Promise.all(
                       data.map(async (ride) => {
                           const customer = await UserService.getUserByUsername(ride.usernameKunde);
                           const driver = await UserService.getUserByUsername(ride.usernameFahrer);

                           return {
                               ...ride,
                               customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unbekannt',
                               driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Unbekannt',
                           };
                       })
                   );

                   setData(rides);

           })
           .catch((error) => {
               setError("Fehler beim Abrufen der Fahrt-Historie: " + error.response?.data);
           });
   }, [currentUser]);



    const headCells = [
        { id: 'id', label: 'Fahrt-ID' },
        { id: 'endTime', label: 'Zeitpunkt der Beendung' },
        { id: 'distance', label: 'Distanz' },
        { id: 'duration', label: 'Dauer' },
        { id: 'cost', label: 'Preis' },
        { id: 'customerName', label: 'Kunde' },
        { id: 'usernameKunde', label: 'Username des Kunden'},
        { id: 'driverName', label: 'Fahrer' },
        { id: 'usernameFahrer', label: 'Username des Fahrers'}

    ]

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getComparator = (order, orderBy) => {
        return (a, b) => {
            let valA = a[orderBy];
            let valB = b[orderBy];

            if (valA == null) return 1;
            if (valB == null) return -1;

            if (orderBy === 'endTime') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            const comparison = typeof valA === 'string'
                ? valA.localeCompare(valB)
                : valA - valB;

            return order === 'asc' ? comparison : -comparison;
        };
    };

    const sortedRows = useMemo(() => {

        return [...data].sort(getComparator(order, orderBy));
    }, [order, orderBy, data]);


    if(error){return <p>{error}</p> }

    if(!currentUser){return <p>Lade Benutzerdaten...</p>}

    return (



        <TableContainer>
            <TextField label={"Suche"} type={"text"} value={search} onChange={(e) => setSearch(e.target.value)}></TextField>
            <Table>
                <TableHead>
                    <TableRow>
                        {headCells.map((headCell) => (
                            <TableCell key={headCell.id}>
                                 <TableSortLabel
                                    active = {orderBy === headCell.id}
                                    direction = {orderBy === headCell.id ? order: "asc"}
                                    onClick={ () => handleRequestSort(headCell.id)}>
                                    {headCell.label}
                                </TableSortLabel>


                            </TableCell>

                        ))}

                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedRows.filter((row) => {
                        return (
                            row.customerName.toLowerCase().includes(search.toLowerCase()) || row.driverName.toLowerCase().includes(search.toLowerCase())
                        );
                    })




                        .map((val) => (

                            <TableRow key={val.id}>

                                <TableCell>{val.id}</TableCell>
                                <TableCell>{new Date(val.endTime).toLocaleString()}</TableCell>
                                <TableCell>{val.distance} km</TableCell>
                                <TableCell>{val.duration} Minuten</TableCell>
                                <TableCell>{val.cost} €</TableCell>
                                <TableCell>{val.customerName}</TableCell>
                                <TableCell> <Link to={`/profile/${val.usernameKunde}`}>{val.usernameKunde}</Link></TableCell>
                                <TableCell>{val.driverName}</TableCell>
                                <TableCell> <Link to={`/profile/${val.usernameFahrer}`}>{val.usernameFahrer}</Link></TableCell>

                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
    export default RideHistory;