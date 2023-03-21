const initialData = {
    tasks: {
        '369f3da7': {id: '369f3da7', content: 'Learn React', done: true},
        'ea82cd27': {id: 'ea82cd27', content: 'Make a todo app', done: true},
        '290e4c43': {id: '290e4c43', content: 'Host it on my server', done: false},
        '71db82c1': {id: '71db82c1', content: 'Make bed', done: false},
        '455a6d80': {id: '455a6d80', content: 'Do the dishes', done: false},
        'f68d3b4d': {id: 'f68d3b4d', content: 'Vacuum the floor', done: false},
        'b1f39e84': {id: 'b1f39e84', content: 'Test', done: false},
    },
    groups: {
        'HOME': {
            id: 'HOME',
            title: 'HOME',
            tasks: ['b1f39e84'],
        },
        '6c715226': {
            id: '6c715226',
            title: 'Webdev',
            tasks: ['369f3da7','ea82cd27','290e4c43'],
        },
        '51115179': {
            id: '51115179',
            title: 'Chores',
            tasks: ['71db82c1','455a6d80','f68d3b4d'],
        },
    },
    groupsOrder: ['6c715226','51115179']
};

export default initialData;