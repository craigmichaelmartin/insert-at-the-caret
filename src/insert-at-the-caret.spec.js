const _work = require('./insert-at-the-caret')._work;

const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);
const alters = [
  '@',
  // all beginings
  ' @',
  '\n@',
  ' \n@',
  '\n @',
  // all endings
  '@ ',
  '@\n',
  '@ \n',
  '@\n ',
  // first begining (space) with all endings
  ' @ ',
  ' @\n',
  ' @ \n',
  ' @\n ',
  // second beginning (\n) with all endings
  '\n@ ',
  '\n@\n',
  '\n@ \n',
  '\n@\n ',
  // third beginning ( \n) with all endings
  ' \n@ ',
  ' \n@\n',
  ' \n@ \n',
  ' \n@\n ',
  // forth beginning (\n ) with all endings
  '\n @ ',
  '\n @\n',
  '\n @ \n',
  '\n @\n '
];

const getScenarios = roots => {
  return [].concat(
    ...roots.map(root => {
      return [].concat(
        ...alters.map(alter => {
          const str = alter.replace('@', root);
          return {
            selectionStart: str.indexOf('^'),
            selectionEnd: str.lastIndexOf('^'),
            value: str.replace(/\^/g, '')
          };
        })
      );
    })
  );
};

test('surround feature - a whole bunch of stuff', () => {
  const roots = [
    '^',
    '^foo',
    '^foo^',
    '^****',
    '****^',
    '**^**',
    '**^foo**',
    '**foo^**',
    '**^foo^**',
    '**f^oo**'
  ];
  const scenarios = getScenarios(roots);
  scenarios.forEach(scenario => {
    expect(_work(scenario, { surround: '**' })).toMatchSnapshot();
  });
});

test('startLineChars', () => {
  const roots = [
    '^',
    '## ^',
    '## ^This is it',
    '^## This is it',
    '## This is it^',
    '#### ^',
    '#### ^This is it',
    '^#### This is it',
    '#### This is it^'
  ];
  const scenarios = getScenarios(roots);
  const removeFirstX = function(line) {
    var val = 0;
    ['### ', '#### '].some(function(starter) {
      return line.indexOf(starter) === 0 && (val = starter.length);
    });
    return val;
  };
  scenarios.forEach(scenario => {
    expect(
      _work(scenario, { startLineChars: '#### ', removeFirstX })
    ).toMatchSnapshot();
  });
});

test('newLineChars', () => {
  const roots = [
    '^',
    '- ^',
    '- ^This is it',
    '^- This is it',
    '- This is it^',
    '1. ^',
    '1. ^This is it',
    '^1. This is it',
    '1. This is it^'
  ];
  const scenarios = getScenarios(roots);
  // Todo: this is way to heavy for being in a test
  const prefix = function(preceding) {
    var indentSpace = 4;
    var currentLine = preceding.substring(preceding.lastIndexOf('\n') + 1);
    var firstWord = currentLine.trim().split(' ')[0];
    var indentNumber =
      firstWord === '-' ||
      (firstWord.indexOf('.') === firstWord.length - 1 &&
        isNumeric(firstWord.substring(0, firstWord.length - 1)))
        ? Math.floor(currentLine.search(/\S|$/) / 4) * 4 + indentSpace
        : 0;
    return (
      '\n' +
      Array.apply(null, { length: indentNumber })
        .map(function() {
          return ' ';
        })
        .join('')
    );
  };
  scenarios.forEach(scenario => {
    expect(_work(scenario, { newLineChars: '- ', prefix })).toMatchSnapshot();
  });
});

test('function', () => {
  const roots = ['^', '^ words', '^words^', 'words ^'];
  const scenarios = getScenarios(roots);
  var fn = function(highlighted) {
    return '[' + (highlighted || 'Link Text') + '](Link Url)';
  };
  scenarios.forEach(scenario => {
    expect(_work(scenario, fn)).toMatchSnapshot();
  });
});

test('text', () => {
  const roots = ['^', '^ words', '^words^', 'words ^'];
  const scenarios = getScenarios(roots);
  scenarios.forEach(scenario => {
    expect(_work(scenario, 'TEXT')).toMatchSnapshot();
  });
});
