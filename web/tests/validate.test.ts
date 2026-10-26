import { describe, test, expect } from 'bun:test';
import { validateQuestionsImport } from '../src/types/validate-import';
const valid = () => ({topics:[{id:'t',title:'Topic',section:'Section',sortOrder:1}],questions:[{id:'q',number:1,topicId:'t',text:'Question',options:[{letter:'A',text:'Yes'}],correctLetter:'A',explicacion:null}]});
describe('question validation', () => {
 test('valid question',()=>expect(validateQuestionsImport(valid())).toBe(true));
 test('duplicate topics',()=>{const d=valid(); d.topics.push(d.topics[0]);expect(()=>validateQuestionsImport(d)).toThrow('duplicate topic');});
 test('duplicate questions',()=>{const d=valid(); d.questions.push(d.questions[0]);expect(()=>validateQuestionsImport(d)).toThrow('duplicate question');});
 test('duplicate numbers',()=>{const d=valid(); d.questions.push({...d.questions[0],id:'q2'});expect(()=>validateQuestionsImport(d)).toThrow('duplicate question numbers');});
 test('missing topic',()=>{const d=valid(); d.questions[0].topicId='absent';expect(()=>validateQuestionsImport(d)).toThrow('must exist');});
 test('absent answer',()=>{const d=valid(); d.questions[0].correctLetter='B';expect(()=>validateQuestionsImport(d)).toThrow('correct answer');});
 test('duplicate options',()=>{const d=valid();d.questions[0].options.push(d.questions[0].options[0]);expect(()=>validateQuestionsImport(d)).toThrow('duplicate option');});
});
