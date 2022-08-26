import './ShowCourse.css'

import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Spinner from 'react-bootstrap/Spinner'

import { getShowCourse, createCourse, deleteCourse } from "../../api/course";
import CreateCourseButton from "../shared/CreateCourseButton";
import DeleteCourseButton from "../shared/DeleteCourseButton";
import CreateTeeTimeModal from '../teetimes/CreateTeeTimeModal';
import CourseTeeTimesList from '../teetimes/CourseTeeTimesList';

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

const ShowCourse = (props) => {
	const { msgAlert, user, courseToShow } = props

    const [courseDetails, setCourseDetails] = useState(null)
    const [courseInDatabase, setCourseInDatabase] = useState(false)
    const [refreshThisCourse, setRefreshThisCourse] = useState(true)
    const [expanded, setExpanded] = useState(false);
    const [showAddTeeTimeModal, setShowAddTeeTimeModal] = useState(false)

	// console.log('props in ShowCourse:', props)
    console.log('Course details: ', courseDetails)

    useEffect(() => {
        console.log('ShowCourse mounted')
        getShowCourse(user ? user._id : null, courseToShow.courseId)
            // .then()
            .then(course => setCourseDetails(course.data.course))
            .then(setCourseInDatabase(true))
            .catch(() => {
                const apiKey = process.env.REACT_APP_RAPIDAPI_API_KEY

                axios.request({
                    method: 'GET',
                    url: 'https://golf-course-finder.p.rapidapi.com/course/details',
                    params: { zip: `${courseToShow.courseZip}`, name: `${courseToShow.courseName}` },
                    headers: {
                        'X-RapidAPI-Key': `${apiKey}`,
                        'X-RapidAPI-Host': 'golf-course-finder.p.rapidapi.com'
                    }
                })
                    .then(res => {
                        console.log('API response: ', res)
                        setCourseDetails(() => {
                            const result = res.data.course_details.result
                            return ({
                                name: result.name,
                                address: result.formatted_address,
                                phoneNumber: result.formatted_phone_number,
                                website: result.website, 
                                hours: result.permanently_closed
                                    ? 
                                        null 
                                    : 
                                        result.opening_hours.weekday_text,
                                courseId: courseToShow.courseId
                            })
                        })
                    })
                    .then(setCourseInDatabase(false))
                    .catch(err => {
                        console.log(err)
                    })
            })
    }, [refreshThisCourse])

    const addToMyCourses = (e) => {
        e.preventDefault()

        createCourse(user, courseDetails)
        // promise handling for createCourse here:
            // send a success message to the user
            .then(() => {
                msgAlert({
                    heading: 'Done',
                    message: 'Course added to My Courses',
                    variant: 'success'
                })
                setRefreshThisCourse(prev => !prev)
            })
            // .then()
            // if there is an error, tell the user about it
            .catch(() => {
                msgAlert({
                    heading: 'Error',
                    message: 'Something went wrong',
                    variant: 'danger'
                })
            })
    }

    const deleteFromMyCourses = (e) => {
        e.preventDefault()

        deleteCourse(user, courseDetails.courseId)
        // promise handling for createCourse here:
            // send a success message to the user
            .then(() => {
                msgAlert({
                    heading: 'Done',
                    message: 'Course deleted from My Courses',
                    variant: 'success'
                })
                setRefreshThisCourse(prev => !prev)
            })
            // .then()
            // if there is an error, tell the user about it
            .catch(() => {
                msgAlert({
                    heading: 'Error',
                    message: 'Something went wrong',
                    variant: 'danger'
                })
            })
    }

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    if (!courseDetails) return (
        <div className="show-course-container">
            <Spinner animation="border" role="status" variant="light">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    )

	return (
        <div className="show-course-container">
            <Card sx={{ width: '90%', maxWidth: 800 }}>
                <CardHeader
                    title={courseDetails.name}
                    style={{backgroundColor: 'rgba(233, 233, 233, 0.8)'}}
                    // subheader="Date:"
                />
                <CardContent>
                    <Typography color="text.secondary">
                        Address:
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} variant="body2">
                        {courseDetails.address}
                    </Typography>
                    <Typography color="text.secondary">
                        Phone Number:
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} variant="body2">
                        {courseDetails.phoneNumber}
                    </Typography>
                    <Typography color="text.secondary">
                        Website:
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} variant="body2">
                        <a href={courseDetails.website} target="_blank">
                            {courseDetails.website}
                        </a>
                    </Typography>
                    <Typography color="text.secondary">
                        Hours:
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} variant="body2">
                        {courseDetails.hours.map(timeframe =>
                            <div>
                                {timeframe}
                            </div>
                        )}
                    </Typography>
                </CardContent>
                <CardActions disableSpacing>
                    {user
                        ?   
                            <Stack spacing={0} style={{margin: 2, justifyContent: 'left'}}>
                                <CreateTeeTimeModal 
                                    user={user}
                                    msgAlert={msgAlert}
                                    courseDetails={courseDetails}
                                    refreshThisCourse={refreshThisCourse}
                                    setRefreshThisCourse={setRefreshThisCourse}
                                    showAddTeeTimeModal={showAddTeeTimeModal}
                                    setShowAddTeeTimeModal={setShowAddTeeTimeModal}
                                />
                                {courseInDatabase && courseDetails.owner && courseDetails.owner === user._id
                                    ?
                                    <DeleteCourseButton
                                        user={user}
                                        deleteFromMyCourses={deleteFromMyCourses}
                                    />
                                    :
                                    <CreateCourseButton
                                        user={user}
                                        addToMyCourses={addToMyCourses}

                                    />
                                }
                            </Stack>
                            // <div style={{display: 'block'}}>
                                
                            // </div>
                            
                        :
                            null
                    }
                    
                    {/* <IconButton aria-label="share">
                        <ShareIcon />
                    </IconButton> */}
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        style={{borderRadius: '50px'}}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        {expanded === false
                            ?
                                <div style={{fontSize: '15px'}}>See tee times posted</div>
                            :
                                null
                        }
                        <ExpandMoreIcon />
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        < CourseTeeTimesList
                            user={user}
                            msgAlert={msgAlert}
                            courseDetails={courseDetails}
                            refreshThisCourse={refreshThisCourse}
                        />
                    </CardContent>
                </Collapse>
            </Card>
        </div>
	)
}

export default ShowCourse

///////////////////////////////////////////////////////////////