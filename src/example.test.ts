describe('example.ts', ()=>{
    describe('test subsuite', ()=> {
        test('test name 1', ()=> {
            expect(1).toBe(1)
        })
        test('test name 2', ()=> {
            expect(1).not.toBe(2)
        })
    })
})

/*
* GOOD JEST PRACTICES
* - Use describe to group tests
* - Use test to write individual tests
* - Test only one function/case at a time
* - Avoid calling multiple functions in a single test (use mock functions)
* - File names should end with .test.ts
* 
* RUN npm run test TO RUN ALL TESTS
* RUN npm run test:coverage TO CHECK CODE COVERAGE
*/