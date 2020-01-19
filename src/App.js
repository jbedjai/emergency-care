import React, {Component} from 'react'

import Button from '@material-ui/core/Button'

export class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      patients: [],
      nurses: ["nurse1"],
      physicians: ["physician1"],
      waitingRooms: [],
      examRoomUsed: [],
      examRoomAvailable: [{name: "room1"}],
      emergencyRoom: [],
    }
  }

  displayRoom(room, cpt) {
    return <p key={cpt}> {room.name && room.name} {room.nurse && ','
    + room.nurse} {room.physician && ','
    + room.physician} {room.patient
    && ','
    + room.patient} </p>
  }

  newPatient() {
    const newPatient = `patient ${Math.floor(Math.random() * Math.floor(1000))}`
    this.setState({
      patients: [...this.state.patients, newPatient],
    })
  }

  newRessources() {
    const newRoom = {name: `room ${Math.floor(Math.random() * Math.floor(100))}`}
    const newNurse = `nurse ${Math.floor(Math.random() * Math.floor(1000))}`
    const newPhysician = `patient ${Math.floor(Math.random() * Math.floor(100000))}`

    const ressourceProviderChoice = Math.floor(Math.random() * Math.floor(4))

    if (this.state.waitingRooms.length === 0) {
      if (ressourceProviderChoice > 0 ) {
        console.info("request accepted by the ressource provider ")

        this.setState({
          examRoomAvailable: [...this.state.examRoomAvailable, newRoom],
          nurses: [...this.state.nurses, newNurse],
          physicians: [...this.state.physicians, newPhysician],
        })
        console.info("ressources added")
      } else {
        console.info("request refused by the ressources provider")
      }
    } else {
      console.info("waiting room not empty, can't ask for request")
    }
  }

  render() {
    const {patients, nurses, physicians, examRoomAvailable, waitingRooms, examRoomUsed, emergencyRoom} = this.state

    return (
        <div>
          <h1> Petri net </h1>
          <div> patients: {patients}</div>
          <div> nurses: {nurses}</div>
          <div> physicians: {physicians}</div>
          <div> emergencyRoom: {emergencyRoom}</div>
          <div> waitingRooms: {waitingRooms}</div>
          <div> examRoomUsed: {examRoomUsed.map(
              (room, cpt) => this.displayRoom(room, cpt))}</div>
          <div> examRoomAvailable: {examRoomAvailable.map(
              (room, cpt) => this.displayRoom(room, cpt))}</div>

          <Button color={"primary"} onClick={() => this.newPatient()}> new patient
            enter </Button>

          <Button color="primary" onClick={() => this.checkinInEmergencyRoom()}> emergency
            room </Button>
          <Button color="primary" onClick={() => this.checkRessources()}> go to waiting room
            and be treat </Button>

          <br/>

          <Button color={"primary"} onClick={() => this.newRessources()}> new ressource
            enter </Button>


        </div>
    )
  }

  checkinInEmergencyRoom() {
    const patients = this.state.patients
    const patientEmergency = patients.pop()

    console.info("début du check-in, patient mis en emergency room")
    this.setState({
      emergencyRoom: [...this.state.emergencyRoom, patientEmergency],
      patients: [...patients]
    })
    console.info("fin du check-in")
  }

  async checkRessources() {
    const emergencyRoom = this.state.emergencyRoom
    const patientWaitingRoom = emergencyRoom.pop()
    if (emergencyRoom.length < 3) {
      console.info("get in waiting room")
      await this.setState({
        waitingRooms: [...this.state.waitingRooms, patientWaitingRoom],
        emergencyRoom: emergencyRoom.length < 1 && []
      })
    } else {
      console.info("too much patients, go out")
      await this.setState({
        patients: [...this.state.patients, patientWaitingRoom],
        emergencyRoom: [...emergencyRoom]
      })
    }
    this.goTreatment()
  }

  async goTreatment() {
    const {waitingRooms, examRoomAvailable, nurses} = this.state

    if (
        waitingRooms.length >= 1
        && examRoomAvailable
        && nurses.length >= 1) {
      const waitingRooms = this.state.waitingRooms
      const patientInTreatment = waitingRooms.pop()

      const nurses = this.state.nurses
      const nurseWorking = nurses.pop()

      const examRoomAvailable = this.state.examRoomAvailable
      const roomAvailableToUsed = examRoomAvailable.pop()
      roomAvailableToUsed.nurse = nurseWorking
      roomAvailableToUsed.patient = patientInTreatment
      const examRoomUsed = [roomAvailableToUsed]

      if (this.state.examRoomUsed.length > 0) {
        examRoomUsed.concat(...this.state.examRoomUsed, roomAvailableToUsed)
      }
      // patients go to the available room and free waiting room
      await this.setState({
        examRoomUsed: [...examRoomUsed],
        examRoomAvailable: examRoomAvailable,
        waitingRooms: [...waitingRooms],
        nurses: [...nurses]
      })

      const currentComponent = this
      setTimeout(this.doTreatment, 1000, currentComponent);
    } else {
      console.info("room or or nurse not available, patient is waiting...")
    }

  }

  async doTreatment(currentComponent) {
    if (currentComponent.state.examRoomUsed.length > 0
        && currentComponent.state.physicians.length > 0) {
      console.info("treatment in progress...")
      const physiciansAvailable = currentComponent.state.physicians
      const newPhysician = physiciansAvailable.pop()

      const examRoomUsed = currentComponent.state.examRoomUsed
      const newExamRoomUsed = examRoomUsed.pop()
      newExamRoomUsed.physician = newPhysician

      const nurseFinishedWork = newExamRoomUsed.nurse
      delete newExamRoomUsed.nurse

      await currentComponent.setState({
        examRoomUsed: [...examRoomUsed, newExamRoomUsed],
        physicians: [...physiciansAvailable],
        nurses: [...currentComponent.state.nurses,
          nurseFinishedWork]
      })
      console.info("treatment done ! exam room, physician and nurses are available")

      setTimeout(currentComponent.endTreatment, 1000, currentComponent);
    } else {
      console.info("no room or physician available")

    }

  }

  async endTreatment(currentComponent) {
    console.info("The room now available")

    const newExamRoomUsed = currentComponent.state.examRoomUsed
    const roomFreeAgain = newExamRoomUsed.pop()
    const physician = roomFreeAgain.physician

    delete roomFreeAgain.physician
    delete roomFreeAgain.patient

    await currentComponent.setState({
      physicians: [...currentComponent.state.physicians,
        physician],
      examRoomAvailable: [...currentComponent.state.examRoomAvailable,
        roomFreeAgain],
      examRoomUsed: newExamRoomUsed
    })

  }
}

App.propTypes = {}

export default (App)
