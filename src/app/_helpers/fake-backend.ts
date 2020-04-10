// import { Injectable } from '@angular/core';
// import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { Observable, of, throwError,from } from 'rxjs';
// import { delay, mergeMap, materialize, dematerialize,distinct, filter } from 'rxjs/operators';

// import { User } from '../_models/user';
// import { Role } from '../_models/role';
// import { Message } from '../_models/message';
// import { Dialog } from '../_models/dialog';
// import { FileDetector } from 'protractor';

// const users: User[] = [
//     { id: 1, username: 'admin', password: 'admin', firstName: 'Administrator', lastName: 'LastName1', role: Role.Admin },
//     { id: 2, username: 'user', password: 'user', firstName: 'John', lastName: 'Doe', role: Role.User },
//     { id: 3, username: 'user1', password: 'user1', firstName: 'Jake', lastName: 'Weary', role: Role.User },
//     { id: 4, username: 'user2', password: 'user2', firstName: 'Samuel', lastName: 'Serif', role: Role.User },
//     { id: 5, username: 'user3', password: 'user3', firstName: 'Jonquil', lastName: 'Von Haggerston', role: Role.User },
//     { id: 6, username: 'user4', password: 'user4', firstName: 'Eleanor', lastName: 'Fant', role: Role.User }
// ];

// const messages: Message[] = [
//     { id: 1, content: 'hello1', userFrom: users[0], userTo: users[1], date: Date.now() },
//     { id: 1, content: 'hello2', userFrom: users[0], userTo: users[1], date: Date.now() + 1 },
//     { id: 1, content: 'hello3', userFrom: users[0], userTo: users[1], date: Date.now() + 2 },
//     { id: 1, content: 'hello4', userFrom: users[0], userTo: users[1], date: Date.now() + 3 },
//     { id: 1, content: 'hello5', userFrom: users[0], userTo: users[1], date: Date.now() + 4 },
//     { id: 1, content: 'hello6', userFrom: users[0], userTo: users[1], date: Date.now() + 5 },
// ]

// const dialogs: Dialog[] = [
//     {userOwner: users[0],userWith: users[1], muted : true},
//     {userOwner: users[0],userWith: users[2], muted : false},
//     {userOwner: users[0],userWith: users[3], muted : true},
//     {userOwner: users[0],userWith: users[4], muted : false},
//     {userOwner: users[0],userWith: users[5], muted : false},
// ]

// @Injectable()
// export class FakeBackendInterceptor implements HttpInterceptor {
//     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         const { url, method, headers, body } = request;

//         // wrap in delayed observable to simulate server api call
//         return of(null)
//             .pipe(mergeMap(handleRoute))
//             .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
//             .pipe(delay(500))
//             .pipe(dematerialize());

//         function handleRoute() {
//             switch (true) {
//                 case url.endsWith('/users/authenticate') && method === 'POST':
//                     return authenticate();
//                 case url.endsWith('/users') && method === 'GET':
//                     return getUsers();
//                 case url.match(/\/users\/\d+$/) && method === 'GET':
//                     return getUserById();
//                 case url.endsWith('/messages') && method === 'POST':
//                     return getMessages();
//                 case url.endsWith('/dialogs') && method === 'POST':
//                     return getDialogs();
//                 default:
//                     // pass through any requests not handled above
//                     return next.handle(request);
//             }

//         }

//         // route functions
//         function getDialogs() {
//             const {user} = body;
//             console.log(user)
//             console.log(dialogs);

//             return ok(
//                 dialogs.filter(
//                     (dialog) => {return dialog.userOwner.id == user.id}
//                     )
//             );
//         }

//         function getMessages() {
//             const { user } = body;
//             return ok(userMessages(user));
//         }

//         function userMessages(user: User) {
//             return messages.filter((message) => {
//                 if (message.userFrom.id == user.id)
//                     return true;
//             })
//         }


//         function authenticate() {
//             const { username, password } = body;
//             const user = users.find(x => x.username === username && x.password === password);
//             if (!user) return error('Username or password is incorrect');
//             return ok({
//                 id: user.id,
//                 username: user.username,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 role: user.role,
//                 token: `fake-jwt-token.${user.id}`
//             });
//         }

//         function getUsers() {
//             if (!isAdmin()) return unauthorized();
//             return ok(users);
//         }

//         function getUserById() {
//             if (!isLoggedIn()) return unauthorized();

//             // only admins can access other user records
//             if (!isAdmin() && currentUser().id !== idFromUrl()) return unauthorized();

//             const user = users.find(x => x.id === idFromUrl());
//             return ok(user);
//         }

//         // helper functions

//         function ok(body) {
//             return of(new HttpResponse({ status: 200, body }));
//         }

//         function unauthorized() {
//             return throwError({ status: 401, error: { message: 'unauthorized' } });
//         }

//         function error(message) {
//             return throwError({ status: 400, error: { message } });
//         }

//         function isLoggedIn() {
//             const authHeader = headers.get('Authorization') || '';
//             return authHeader.startsWith('Bearer fake-jwt-token');
//         }

//         function isAdmin() {
//             return isLoggedIn() && currentUser().role === Role.Admin;
//         }

//         function currentUser() {
//             if (!isLoggedIn()) return;
//             const id = parseInt(headers.get('Authorization').split('.')[1]);
//             return users.find(x => x.id === id);
//         }

//         function idFromUrl() {
//             const urlParts = url.split('/');
//             return parseInt(urlParts[urlParts.length - 1]);
//         }
//     }
// }

// export const fakeBackendProvider = {
//     // use fake backend in place of Http service for backend-less development
//     provide: HTTP_INTERCEPTORS,
//     useClass: FakeBackendInterceptor,
//     multi: true
// };