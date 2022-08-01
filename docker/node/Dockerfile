FROM node:16

RUN apt-get update && apt-get install -y \
      chromium \
      chromium-l10n \
      fonts-liberation \
      fonts-roboto \
      hicolor-icon-theme \
      libcanberra-gtk-module \
      libexif-dev \
      libgl1-mesa-dri \
      libgl1-mesa-glx \
      libpangox-1.0-0 \
      libv4l-0 \
      fonts-symbola \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /etc/chromium.d/
#
## Add chromium user
#RUN groupadd -r chromium && useradd -r -g chromium -G audio,video chromium \
#    && mkdir -p /home/chromium/Downloads && chown -R chromium:chromium /home/chromium


