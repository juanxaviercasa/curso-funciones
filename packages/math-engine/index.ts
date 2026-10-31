export function exactNumber(input:unknown,expected:number):boolean {
 if(typeof input!=='string' || input.length>40) return false;
 const normalized=input.trim().replace(',','.');
 if(!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) return false;
 const value=Number(normalized);
 return Number.isFinite(value) && value===expected;
}
export function evaluateSample(answer:unknown){return {correct:exactNumber(answer,11),explanation:'Sustituye x por 4: f(4) = 2 × 4 + 3 = 11.'};}
