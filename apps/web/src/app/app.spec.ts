import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';

describe('App', () => {
  beforeEach(async () => {
    class ResizeObserverStub {
      observe() {}
      disconnect() {}
    }

    (globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
      ResizeObserverStub as unknown as typeof ResizeObserver;

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers]
    }).compileComponents();
  });

  it('creates the shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
