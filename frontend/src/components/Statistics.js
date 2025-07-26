import {useEffect, useState, useContext} from "react";
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import { BarChart } from '@mui/x-charts/BarChart';
import RideHistoryService from "../services/RideHistoryService";
import { AuthContext } from "../contexts/AuthContext";

function Statistics(){

    const [type, setType] = useState("");
    const [selectedLabel,setLabel] = useState("");
    const [time, setTime] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const[data,setData] = useState(null);
    const [sortedData,setSortedData] = useState([]);
    const [error,setError] = useState(null);
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {

        RideHistoryService.getRideHistory(currentUser?.username)
            .then((data) => {

                const rides =

                    data.map( (ride) => {

                        const day = new Date(ride.endTime).getDate();

                        return {
                            ...ride,
                            endMonth: ride.endMonth,
                            endYear: ride.endYear,
                            endDay: day
                        }
                    })
                setData(rides);
            })

            .catch((error) => {
                console.error("Ride History not found", error);
                setError("Fehler beim Anzeigen der Statistiken");
            });
    },[currentUser]);


        const handleTypeChange = (event) => {
            setType(event.target.value);
            if(event.target.value === "cost"){
                setLabel("Umsatz (€)");
            }
            if(event.target.value === "duration"){
                setLabel("Fahrzeit (Min)");
            }
            if(event.target.value === "distance"){
                setLabel("Distanz (km)");
            }
        };

        const handleTimeChange = (event) => {
            setTime(event.target.value);
        };

        const handleYearChange = (event) => {
            setYear(event.target.value);
        };

        const handleMonthChange = (event) => {
            setMonth(event.target.value);
        };

        const daysInMonth = (month,year) => {
            return new Date(year, month, 0).getDate();
        }



        useEffect(() => {

        if(!data) return;

        if(type && time==="monthly" && year){

            let monthlyData = Array(12).fill(0);
            data.forEach((ride) => {
                if(ride.endYear === year && !isNaN(ride[type])){
                    monthlyData[ride.endMonth-1] += ride[type];
                }
            });

            setSortedData(monthlyData);
            console.log(data);
            console.log(monthlyData);
        }

        if(type && time==="daily" && year && month){
            let dailyData = Array(daysInMonth(month,year)).fill(0);
            data.forEach((ride) => {
                if (ride.endYear === year && ride.endMonth === month && !isNaN(ride[type])){
                    dailyData[ride.endDay-1] += ride[type];
                }
            });
            setSortedData(dailyData);
            console.log(dailyData);
            console.log(data);
        }
        }, [type,time,year,data,month]);


        if(error){
            return <p>{error}</p>
        }

    return (


            <Container maxWidth={"md"} sx={{py:"34px"}}>
            <Box  sx={{ display: "flex", flexDirection:"column",alignItems:"center", gap:"20px", mb:"34px"}}>
                <h1> Statistiken</h1>
                <FormControl fullWidth>

                    <InputLabel>Art der Statistik</InputLabel>
                    <Select
                        variant="outlined"
                        value={type}
                        label="Art der Statistik"
                        onChange={handleTypeChange}
                    >
                        <MenuItem value={"cost"}>Einnahmen</MenuItem>
                        <MenuItem value={"distance"}>gefahrene Distanz</MenuItem>
                        <MenuItem value={"duration"}>Fahrzeit</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>

                    <InputLabel>Ansicht</InputLabel>
                    <Select
                        variant="outlined"
                        value={time}
                        label={"Ansicht"}
                        onChange={handleTimeChange}>

                        <MenuItem value={"monthly"}>Monatlich</MenuItem>
                        <MenuItem value={"daily"}>Täglich</MenuItem>

                    </Select>

                </FormControl>

                {time ==="daily" &&
                    <FormControl fullWidth>
                        <InputLabel>Monat</InputLabel>
                        <Select
                            variant="outlined"
                            value={month}
                            label={"Monat"}
                            onChange={handleMonthChange}>
                            <MenuItem value={1}>Januar</MenuItem>
                            <MenuItem value={2}>Februar</MenuItem>
                            <MenuItem value={3}>März</MenuItem>
                            <MenuItem value={4}>April</MenuItem>
                            <MenuItem value={5}>Mai</MenuItem>
                            <MenuItem value={6}>Juni</MenuItem>
                            <MenuItem value={7}>Juli</MenuItem>
                            <MenuItem value={8}>August</MenuItem>
                            <MenuItem value={9}>September</MenuItem>
                            <MenuItem value={10}>Oktober</MenuItem>
                            <MenuItem value={11}>November</MenuItem>
                            <MenuItem value={12}>Dezember</MenuItem>
                        </Select>
                    </FormControl>}

                {time &&
                <FormControl fullWidth>
                    <InputLabel>Jahr</InputLabel>
                    <Select
                        variant="outlined"
                        value={year}
                        label={"Jahr"}
                        onChange={handleYearChange}>


                        {Array.from({length:10}, (_,i) => {
                            const year = new Date().getFullYear() - i;
                            return(
                                <MenuItem key= {year} value={year}>{year}</MenuItem>

                            );
                        })}

                    </Select>
                </FormControl>
                }
            </Box>


                <Box sx={{display:"flex", justifyContent:"center"}}>
            {type && time==="monthly" && year &&


            <BarChart

                yAxis={ [
                {label: selectedLabel}
            ]}
                xAxis={[
                    {
                       id: 'categories',
                       data: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                       scaleType: 'band',
                       label: "Monate"
                    },
                ]}
                series={[
                    {
                        data: sortedData,
                        label: selectedLabel,
                    },
                ]}
                width={1000}
                height={800}
            />}

            {type && time==="daily" && year && month &&
                <BarChart

                    yAxis={ [
                        {label: selectedLabel}
                    ]}
                    xAxis={[
                        {
                            id: 'days',
                            data: Array.from({length: daysInMonth(month,year)}, (_,i) => i+1) ,
                            scaleType: 'band',
                            label: "Tage"
                        },
                    ]}
                    series={[
                        {
                            data: sortedData,
                            label: selectedLabel,
                        },
                    ]}
                    width={1000}
                    height={800}
                />}
                </Box>
            </Container>


    );
}

export default Statistics;
