import './App.css';
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import initialData from './data.js';

function dec2hex (dec) {
  return dec.toString(16).padStart(2, "0")
}

function generateId (len) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}

function App() {
  const [data, setData] = useState(localStorage.getItem("dataKey") !== null ? JSON.parse(localStorage.getItem("dataKey")) : initialData);
  const [focusedTask, setFocusedTask] = useState("")


  useEffect(() => {
    localStorage.setItem('dataKey', JSON.stringify(data));
  }, [data]);

  function getInitialData(){
    if (localStorage.getItem("dataKey") !== null) {
      setData(JSON.parse(localStorage.getItem("dataKey")))
    }
    else {
      setData(initialData)
    }
  }

  const onDragEnd = result => {
    const {destination, source, draggableId, type} = result;
    if (!destination){return;}
    if (destination.droppableId === source.droppableId && destination.index === source.index){return;}

    if (type === "GROUP"){
      const newGroupsOrder = Array.from(data.groupsOrder);
      newGroupsOrder.splice(source.index, 1);
      newGroupsOrder.splice(destination.index, 0, draggableId);

      const newData = {
        ...data,
        groupsOrder: newGroupsOrder,
      }
      setData(newData)
      return;
    }

    const sourceGroup = data.groups[source.droppableId];
    const destGroup = data.groups[destination.droppableId];
    if (sourceGroup === destGroup){
      const newTasks = Array.from(sourceGroup.tasks)
      newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, draggableId)
      const newGroup = {...sourceGroup,tasks: newTasks,};
      const newData = {...data,groups: {...data.groups,[newGroup.id]: newGroup,}}
      setData(newData);
      return;
    }
    const sourceTasks = Array.from(sourceGroup.tasks);
    sourceTasks.splice(source.index, 1);
    const newSourceGroup = {
      ...sourceGroup,
      tasks: sourceTasks
    };
    const destTasks = Array.from(destGroup.tasks);
    destTasks.splice(destination.index, 0, draggableId);
    const newDestGroup = {
      ...destGroup,
      tasks: destTasks
    };
    const newData = {
      ...data,
      groups: {
        ...data.groups,
        [newSourceGroup.id]: newSourceGroup,
        [newDestGroup.id]: newDestGroup,
      }
    }
    if (newSourceGroup.tasks.length === 0 && newSourceGroup.id !== "HOME"){
      delete newData.groups[newSourceGroup.id];
      newData.groupsOrder.splice(newData.groupsOrder.indexOf(newSourceGroup.id),1)
    }
    setData(newData);
  }

  useEffect(() => {
    if (focusedTask !== ""){
      document.getElementById(focusedTask).focus()
      setFocusedTask("")
    }
  }, [focusedTask]);


  function handleTaskCreate(groupId, taskId) {
    const NewTask = {id: taskId, content: "",done:false}
    const group = data.groups[groupId]
    const NewGroup = {
      ...group,
      tasks: [
        ...group.tasks,
        taskId
      ],
    }
    const NewData = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: NewTask,
      },
      groups: {
        ...data.groups,
        [groupId]: NewGroup,
      },
    }
    setData(NewData)
    setFocusedTask(taskId);
  }

  function handleTaskChange(groupId, taskId, event) {
    const NewTask = { ...data.tasks[taskId], content: event.target.value }
    // const NewTask = {id: taskId, content: event.target.value}
    const NewData = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: NewTask,
      }
    }
    setData(NewData)
  }

  function handleGroupChange(groupId, event) {
    const NewGroup = { ...data.groups[groupId], title: event.target.value }
    const NewData = {
      ...data,
      groups: {
        ...data.groups,
        [groupId]: NewGroup,
      }
    }
    setData(NewData)
  }

  function handleTaskChecked(groupId, taskId, event) {
    const NewTask = { ...data.tasks[taskId], done: !data.tasks[taskId].done }
    const NewData = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: NewTask,
      }
    }
    setData(NewData)
  }


  function handleTaskDelete(groupId, taskId) {
    const group = data.groups[groupId]
    const NewGroup = {
      ...group,
      tasks: group.tasks.filter(task => task !== taskId),
    }
    const NewData = {
      ...data,
      groups: {
        ...data.groups,
        [groupId]: NewGroup
      },
    }
    delete NewData.tasks[taskId];
    if (NewGroup.tasks.length === 0){
      delete NewData.groups[groupId];
      NewData.groupsOrder.splice(NewData.groupsOrder.indexOf(groupId),1)
    }
    setData(NewData)
  }

  function handleDeleteGroup(groupId) {

  }

  function handleGroupCreate(groupId) {
    const NewTask = {id: generateId(8), content: "", done:false}
    const NewGroup = {
      id: groupId,
      title: "New Group",
      tasks: [NewTask.id],
    }
    const NewGroupsOrder = Array.from(data.groupsOrder)
    NewGroupsOrder.push(groupId)
    const NewData = {
      tasks: {
        ...data.tasks,
        [NewTask.id]: NewTask
      },
      groups: {
        ...data.groups,
        [groupId]: NewGroup
      },
      groupsOrder: NewGroupsOrder
    }
    console.log(NewData)
    setData(NewData)
    setFocusedTask(NewTask.id);
  };
  
  return(
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="MAIN" type="GROUP">
        {(provided) => (
          <div
          ref={provided.innerRef}
          {...provided.droppableProps}>
          { data.groupsOrder.map((groupId, index) => {
            if (groupId === 'HOME'){
              return
            }
            const group = data.groups[groupId];
            const tasks = group.tasks.map(taskId => data.tasks[taskId]);
            return <Group index={index} key={group.id} id={group.id} title={group.title} tasks={tasks} onGroupChange={handleGroupChange} onTaskChange={handleTaskChange} onTaskDelete={handleTaskDelete} onTaskChecked={handleTaskChecked} onTaskCreate={handleTaskCreate}/>
          })}
          {provided.placeholder}
          </div>
        )}
      </Droppable>
      <NewGroupButton onNewGroup={handleGroupCreate} />
      <div className="HomeGroup">
        <div className="GroupMain">
          <Droppable droppableId={'HOME'} type="TASK">
              {(provided) => (
                <div className="TaskList" ref={provided.innerRef}
                {...provided.droppableProps}>
                  {data.groups['HOME'].tasks.map(taskId => data.tasks[taskId]).map((task, index) => <Task onTaskChecked={handleTaskChecked} done={task.done}  key={task.id} id={task.id} groupId="HOME" content={task.content} index={index} onTaskCreate={handleTaskCreate} onTaskChange={handleTaskChange} onTaskDelete={handleTaskDelete}/>)}
                  {provided.placeholder}
                </div>
              )}
          </Droppable>
          <NewTaskButton group="HOME" onNewTask={handleTaskCreate} />
        </div>
        <div className="GroupHandle"></div>
      </div>
    </DragDropContext>
  )
}

class Group extends React.Component {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event){
    this.props.onGroupChange(this.props.id, event)
  }

  render(){
    return(
      <Draggable draggableId={this.props.id} index={this.props.index} type="GROUP">
        {(provided) => (
          <div className="Group" 
          id={this.props.id}
          ref={provided.innerRef}
          {...provided.draggableProps}>
            <Droppable droppableId={this.props.id} type="TASK">
            {(provided, snapshot) => (
              <div className="GroupMain">
                <input id={this.props.id} className="GroupTitle" type="text" value={this.props.title} onChange={this.handleInputChange}/>
                    <div className="TaskList" ref={provided.innerRef}
                    {...provided.droppableProps}>
                      {this.props.tasks.map((task, index) => 
                        <Task onTaskChecked={this.props.onTaskChecked} done={task.done} key={task.id} id={task.id} groupId={this.props.id} content={task.content} index={index} onTaskChange={this.props.onTaskChange} onTaskDelete={this.props.onTaskDelete} onTaskCreate={this.props.onTaskCreate}/>)}
                      {provided.placeholder}
                    </div>
                <NewTaskButton group={this.props.id} onNewTask={this.props.onTaskCreate} />
              </div>
            )}
            </Droppable>
            <div className="GroupHandle" {...provided.dragHandleProps}>
            </div>
          </div>
        )}
      </Draggable>
    )
  }
}

class Task extends React.Component {

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  handleInputChange(event){
    this.props.onTaskChange(this.props.groupId, this.props.id, event)
  }

  handleBlur(event){
    if(event.target.value === ""){
      this.props.onTaskDelete(this.props.groupId, this.props.id)
    };
  }

  handleCheck(event){
    this.props.onTaskChecked(this.props.groupId, this.props.id)
  };

  handleKeyUp(event){
    if(event.key === "Enter"){
      this.props.onTaskCreate(this.props.groupId, generateId(8))
    };
    if(event.key === "Delete"){
      this.props.onTaskDelete(this.props.groupId, this.props.id)
    };
    
  };

  render(){
    return(
      <Draggable draggableId={this.props.id} index={this.props.index}  type="TASK"> 
        {(provided, snapshot) => (
          <div className={`Task ${snapshot.isDragging ? "dragging" : ""} ${this.props.content === "" ? "empty" : ""} ${this.props.done ? "checked" : ""}`} ref={provided.innerRef} {...provided.draggableProps}>
            <input type="checkbox" name="" id="" checked={this.props.done} onChange={this.handleCheck}/>
            <input id={this.props.id} className="TaskContent" type="text" value={this.props.content} onChange={this.handleInputChange} onBlur={this.handleBlur} onKeyUp={this.handleKeyUp}/>
            <div className="TaskHandle" {...provided.dragHandleProps}>
            </div>
          </div>
        )}
      </Draggable>
    )
  }
}

function NewTaskButton({group, onNewTask}) {

  function handleClick(event){
    onNewTask(group, generateId(8))
  };

  return(
    <button className="NewTask" onClick={handleClick}>
      <div className="NewTask-placeholder"></div>
      <div className="NewTask-handle"></div>
    </button>
  )
}

function NewGroupButton({onNewGroup}) {

  function handleClick(event){
    onNewGroup(generateId(8))
  };

  return(
    <button className="NewGroup" onClick={handleClick}>
      <div className="NewGroup-section">
        <div className="NewGroup-title"></div>
      <div className="NewGroup-placeholder">
        <div className="NewGroup-NewTask-placeholder"></div>
        <div className="NewGroup-NewTask-handle"></div>
      </div>
      </div>
      <div className="NewGroup-handle"></div>
    </button>
  )
}

export default App;
