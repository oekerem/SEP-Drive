import React, { useState } from 'react';
import useSWR from 'swr';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, Paper, Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import DriveService from '../services/DriveService';
import { sortByKey } from '../utils/sortUtils';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';


const AcceptedDriversList = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [sortConfig, setSortConfig] = useState({ key: 'totalDrives', direction: 'asc' });

    const {
        data: drive,
        isLoading: loadingDrive
    } = useSWR(['activeDrive', currentUser.username], ([, username]) =>
        DriveService.getActiveDriveForUser(username)
    );

    const {
        data: offers = [],
        isLoading: loadingOffers,
        mutate: mutateOffers
    } = useSWR(
        drive?.id ? ['offersForDrive', drive.id] : null,
        ([, driveId]) => DriveService.getOffersForDrive(driveId)
    );

    const handleSort = (key) => {
        const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
        setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
    };

    const rejectOffer = async (offerId) => {
        try {
            await DriveService.rejectOffer(offerId);
            mutateOffers();
        } catch (err) {
            console.error('Reject error:', err);
        }
    };

    const acceptOffer = async (offerId) => {
        try {
            await DriveService.acceptOffer(drive.id, offerId);
            mutateOffers();
        } catch (err) {
            console.error('Accept error:', err);
        }
    };

    const sortedOffers = sortByKey(offers, sortConfig.key, sortConfig.direction);

    return (
        <div>
            <h2>Fahrerangebote</h2>

            {(loadingDrive || loadingOffers) && <p>Lade Angebote...</p>}

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'fahrerUsername'}
                                    direction={sortConfig.key === 'fahrerUsername' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('fahrerUsername')}
                                >
                                    Fahrer
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'totalDrives'}
                                    direction={sortConfig.key === 'totalDrives' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('totalDrives')}
                                >
                                    Gesamtfahrten
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'totalDistance'}
                                    direction={sortConfig.key === 'totalDistance' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('totalDistance')}
                                >
                                    Gefahrene Distanz
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Aktion</TableCell>
                            <TableCell>Chat</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedOffers.map((offer) => (
                            <TableRow key={offer.id}>
                                <TableCell>
                                    <Link to={`/profile/${offer.fahrerUsername}`}>
                                        {offer.fahrerUsername}
                                    </Link>
                                </TableCell>
                                <TableCell>{offer.totalDrives ?? '–'}</TableCell>
                                <TableCell>{offer.totalDistance != null ? `${offer.totalDistance.toFixed(2)} km` : '–'}</TableCell>
                                <TableCell>{offer.status}</TableCell>
                                <TableCell>
                                    {offer.status === 'PENDING' && (
                                        <Button variant="contained" onClick={() => acceptOffer(offer.id)}>
                                            Annehmen
                                        </Button>
                                    )}
                                    {offer.status !== 'REJECTED' && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => rejectOffer(offer.id)}
                                        >
                                            Ablehnen
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {offer.status !== "REJECTED" &&
                                        <Link to={`/chat/${offer.id}`} state={{username: currentUser.username, role:"KUNDE", partner: offer.fahrerUsername}}>
                                            <Button variant={"outlined"}>Chat</Button>
                                        </Link>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default AcceptedDriversList;
