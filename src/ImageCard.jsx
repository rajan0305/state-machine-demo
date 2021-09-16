import React from 'react';
import { useMachine } from '@xstate/react';
import { assign, createMachine } from 'xstate';

// 1) wait for image to load
// 2) if it fails to load, do nothing
// 3) once ready, wait for mouse over
// 4) on mouse over, expand and show video
// 5) load video source
// 6) wait 2 seconds regardless
// 7) play video
// 8) second time, wait 2 seconds again, play video
// 9) on mouse leave, go back to whatever initial state we had

const netflixStyleVideoHoverMachine = createMachine(
  {
    id: 'netflixStyleVideoHover',

    context: {
      hasVideoLoaded: false
    },

    initial: 'awaitingBackgroundImageLoad',
    states: {
      awaitingBackgroundImageLoad: {
        on: {
          REPORT_IMAGE_LOADED: 'imageLoaded',
          REPORT_IMAGE_FAILED_TO_LOAD: 'imageFailedToLoad'
        }
      },

      imageFailedToLoad: {},

      imageLoaded: {
        on: {
          MOUSE_OVER: 'showingVideo'
        }
      },

      showingVideo: {
        initial: 'checkingIfVideoHasLoaded',
        states: {
          checkingIfVideoHasLoaded: {
            always: [
              {
                target: 'waitingBeforePlaying',
                cond: 'hasVideoLoaded'
              },
              {
                target: 'awaitingVideoLoad'
              }
            ]
          },

          awaitingVideoLoad: {
            initial: 'cannotMoveOn',
            states: {
              cannotMoveOn: {
                after: {
                  2000: 'canMoveOn'
                }
              },

              canMoveOn: {
                always: {
                  target: '#autoPlayingVideo',
                  cond: 'hasVideoLoaded'
                }
              }
            },

            on: {
              REPORT_VIDEO_LOADED: {
                actions: 'reportVideoLoaded'
              }
            }
          },

          waitingBeforePlaying: {
            after: {
              2000: 'autoPlayingVideo'
            }
          },

          autoPlayingVideo: {
            entry: 'playVideo',
            id: 'autoPlayingVideo'
          }
        },
        on: {
          MOUSE_OUT: 'imageLoaded'
        }
      }
    }
  },
  {
    guards: {
      hasVideoLoaded: (ctx) => ctx.hasVideoLoaded
    },

    actions: {
      reportVideoLoaded: assign((ctx, event) => {
        return {
          hasVideoLoaded: true
        };
      })
    }
  }
);

function ImageCard({ imageSrc, title, description }) {
  const videoRef = React.useRef();

  const [state, send] = useMachine(
    netflixStyleVideoHoverMachine.withConfig({
      actions: {
        playVideo: () => {
          videoRef.current.play();
        }
      }
    }),
    {
      devTools: true
    }
  );

  return (
    <a
      href={`#${imageSrc}`}
      onMouseEnter={() => {
        send({ type: 'MOUSE_OVER' });
      }}
      onMouseLeave={() => {
        send({ type: 'MOUSE_OUT' });
      }}
    >
      <img
        src={imageSrc}
        alt=""
        className="cover"
        onLoad={() => {
          send({ type: 'REPORT_IMAGE_LOADED' });
        }}
        onError={() => {
          send({ type: 'REPORT_IMAGE_FAILED_TO_LOAD' });
        }}
      />
      {state.matches('showingVideo') && (
        <video
          tabIndex="-1"
          disablePictureInPicture
          loop
          muted
          className="cover-full"
          ref={videoRef}
          onCanPlay={() => {
            send({ type: 'REPORT_VIDEO_LOADED' });
          }}
        >
          <source
            src={`/assets/Flowers.mp4?key=${imageSrc}`}
            type="video/mp4"
          />
        </video>
      )}
      <div className="text">
        <p>{title}</p>
        <small>{description}</small>
      </div>
    </a>
  );
}

export default ImageCard;
